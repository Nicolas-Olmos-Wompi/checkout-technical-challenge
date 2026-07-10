import {Signer} from '@aws-sdk/rds-signer';

const getAuthToken = async (): Promise<string> => {
  const signer = new Signer({
    region: process.env.AWS_REGION,
    username: process.env.DB_USERNAME!,
    hostname: process.env.DB_HOST!,
    port: +process.env.DB_PORT!,
  });
  return signer.getAuthToken();
};

export const AmazonRDSUtils = {
  getAuthToken,
};
