import { App } from '@aws-cdk/core';
import { config } from 'dotenv';
import { FourDPipelineStack } from './stacks/codepipeline/Stack';
import { DynamoDbStack } from './stacks/dynamodb/Stack';
import { LambdaFleetStack } from './stacks/lambda-fleet/Stack';

config();

// for development, use account/region from cdk cli
const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION ?? 'eu-west-1',
};
const prefix = 'FourD';
const repositoryName = process.env.GIT_REPOSITORY ?? '4dt-api-node';

const app = new App();
new FourDPipelineStack(app, `${prefix}-CodePipelineStack`, repositoryName, { env, description: 'Stack for CodePipeline' });
new LambdaFleetStack(app, `${prefix}-LambdaFleetStack`, 'lambdas', { env, description: 'Stack for Lambda Fleet including private Networking and API GW' });
new DynamoDbStack(app, `${prefix}-DynamoDB`, { env, description: 'Stack for DynamoDB Tables' });

app.synth();