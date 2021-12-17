import { DynamoDBClientConfig } from '@aws-sdk/client-dynamodb';

export const config: DynamoDBClientConfig = process.env.LOCAL ? { endpoint: `http://${process.env.LOCALSTACK_HOSTNAME}:4566`, region: 'eu-west-1' } : {};