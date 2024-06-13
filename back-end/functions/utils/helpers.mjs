import { getSecret } from '@aws-lambda-powertools/parameters/secrets';
import { CacheClient, Configurations, CredentialProvider } from '@gomomento/sdk';

let secrets;
let cacheClient;

export const getSecretValue = async (secretName) => {
  if (!secrets) {
    secrets = await getSecret(process.env.SECRET_ID, { transform: 'json' });
  }
  return secrets[secretName];
};

export const getCacheClient = async () => {
  if (!cacheClient) {
    const authToken = await getSecretValue('momento');

    cacheClient = new CacheClient({
      configuration: Configurations.Lambda.latest(),
      credentialProvider: CredentialProvider.fromString({ authToken }),
      defaultTtlSeconds: 3600
    });
  }

  return cacheClient;
};
