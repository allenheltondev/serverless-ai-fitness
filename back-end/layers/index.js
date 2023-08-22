const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager');
const { CacheClient, Configurations, CredentialProvider } = require('@gomomento/sdk');

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

    cacheClient = new CacheClient({
      configuration: Configurations.Laptop.latest(),
      credentialProvider: CredentialProvider.fromString({ authToken }),
      defaultTtlSeconds: Number(process.env.CACHE_TTL)
    });
  }

  return cacheClient;
};
