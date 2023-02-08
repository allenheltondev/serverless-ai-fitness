const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager');
const { SimpleCacheClient, EnvMomentoTokenProvider, Configurations } = require('@gomomento/sdk');

const secrets = new SecretsManagerClient();
let cachedSecrets;
let momentoClient;
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

exports.getCacheClient = async () => {
  if (!momentoClient) {
    const authToken = await exports.getSecret('momento');
    process.env.AUTH_TOKEN = authToken;
    const credentials = new EnvMomentoTokenProvider({ environmentVariableName: 'AUTH_TOKEN' });

    const cacheClient = new SimpleCacheClient({
      configuration: Configurations.Laptop.latest(),
      credentialProvider: credentials,
      defaultTtlSeconds: Number(process.env.CACHE_TTL)
    });
    momentoClient = cacheClient;

    try {
      await momentoClient.createCache(exports.CACHE_NAME);
    } catch (err) {
      console.info(err);
    }
  }
  return momentoClient;
};