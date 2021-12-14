import { App } from '@aws-cdk/core';
import { FourDPipelineStack } from './stacks/codepipeline/Stack';
import { DynamoDbStack } from './stacks/dynamodb/Stack';
import { LambdaFleetStack } from './stacks/lambda-fleet/Stack';
// import { S3FleetStack } from './stacks/s3/Stack';

// for development, use account/region from cdk cli
const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: 'eu-west-1',
};
const prefix = 'FourD';
const repositoryName = process.env.GIT_REPOSITORY ?? '4dt-api-node';

const app = new App();
new FourDPipelineStack(app, `${prefix}-CodePipelineStack`, repositoryName, { env, description: 'Stack for CodePipeline' });
// new S3FleetStack(app, `${prefix}-S3FleetStack`, { env, description: 'Stack for S3 Fleet' });
new DynamoDbStack(app, `${prefix}-DynamoDbStack`, { env, description: 'Stack for DynamoDB Tables' });
new LambdaFleetStack(app, `${prefix}-LambdaFleetStack`, 'lambdas', { env, description: 'Stack for Lambda Fleet including private Networking and API GW' });

app.synth();