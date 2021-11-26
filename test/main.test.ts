import '@aws-cdk/assert/jest';
import { App } from '@aws-cdk/core';
import { CdkParentStack } from '../src/stacks/parent';

const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT ?? '123456789010',
  region: 'eu-west-1',
};
test('InfraStack', () => {
  const app = new App({
    context: {
      vpcId: 'vpc-123456789',
      privateSubnet1: 'private-subnet-1',
      privateSubnet2: 'private-subnet-2',
    },
  });


  const stack = new CdkParentStack(app, 'test-stack', 'test-repo', { env });
  expect(app.synth().getStackArtifact(stack.artifactId).template).toMatchSnapshot();
});