import '@aws-cdk/assert/jest';
import { App } from '@aws-cdk/core';
import { FourDPipelineStack } from '../src/stacks/codepipeline/Stack';
import { DynamoDbStack } from '../src/stacks/dynamodb/Stack';
import { LambdaFleetStack } from '../src/stacks/lambda-fleet/Stack';

const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT ?? '123456789010',
  region: 'eu-west-1',
};

test('FourDPipelineStack', () => {
  const app = new App({
    context: {
      vpcId: 'vpc-123456789',
      privateSubnet1: 'private-subnet-1',
      privateSubnet2: 'private-subnet-2',
    },
  });
  const pipeline = new FourDPipelineStack(app, 'test-pipeline', 'test-repo', { env });
  expect(app.synth().getStackArtifact(pipeline.artifactId).template).toMatchSnapshot();
});

test('LambdaFleetStack', () => {
  const app = new App({
    context: {
      vpcId: 'vpc-987654321',
      privateSubnet1: 'private-subnet-1',
      privateSubnet2: 'private-subnet-2',
    },
  });
  const lambdas = new LambdaFleetStack(app, 'test-lambda-fleet', 'lambdas', { env });
  expect(app.synth().getStackArtifact(lambdas.artifactId).template).toMatchSnapshot();
});

test('DynamoDbStack', () => {
  const app = new App({
    context: {
      vpcId: 'vpc-555555555',
      privateSubnet1: 'private-subnet-1',
      privateSubnet2: 'private-subnet-2',
    },
  });
  const dynamo = new DynamoDbStack(app, 'test-dynamo', { env });
  expect(app.synth().getStackArtifact(dynamo.artifactId).template).toMatchSnapshot();
});