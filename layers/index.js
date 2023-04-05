const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager');
const { CacheClient, EnvMomentoTokenProvider, Configurations } = require('@gomomento/sdk');

const secrets = new SecretsManagerClient();
let cachedSecrets;
let cacheClient;
exports.CACHE_NAME = 'chatgpt';

exports.getSecret = async (secretKey) => {
  if (cachedSecrets) {
    return cachedSecrets[secretKey];
  } else {
    const secretResponse = await secrets.send(new GetSecretValueCommand({ SecretId: process.env.SECRET_ID }));
    if (secretResponse) {
      cachedSecrets = JSON.parse(secretResponse.SecretString);
      return cachedSecrets[secretKey];
    }
  }
};

exports.getCacheClient = async (caches) => {
  if (!cacheClient) {
    const authToken = await exports.getSecret('momento');
    process.env.AUTH_TOKEN = authToken;
    const credentials = new EnvMomentoTokenProvider({ environmentVariableName: 'AUTH_TOKEN' });

    cacheClient = new CacheClient({
      configuration: Configurations.Laptop.latest(),
      credentialProvider: credentials,
      defaultTtlSeconds: Number(process.env.CACHE_TTL)
    });

    await initializeCaches(caches);
  }

  return cacheClient;
};

const initializeCaches = async (caches) => {
  if (caches?.length) {
    const listCachesResponse = await cacheClient.listCaches();
    const cachesToAdd = caches.filter(c => !listCachesResponse.caches.some(cache => cache.name == c));
    for (const cacheToAdd of cachesToAdd) {
      await cacheClient.createCache(cacheToAdd)
    }
  }
};