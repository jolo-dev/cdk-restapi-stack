import { Construct, Stack, StackProps } from '@aws-cdk/core';
import { FourDPipelineStack } from './codepipeline';
import { LambdaFleetStack } from './lambdaFleet';

// for development, use account/region from cdk cli
const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: 'eu-west-1',
};

export class CdkParentStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const repositoryArn = process.env.GIT_REPOSITORY ?? '4dt-api-node';

    new FourDPipelineStack(this, 'FourDPipelineStack', repositoryArn, { env, description: 'Pipeline consist of CodeCommit, CodeBuild, CodeDeploy(Soon)' });
    new LambdaFleetStack(this, 'LambdaFleetStack', 'lambdas', { env, description: 'The Fleet of Lambdas which will be deployed' });

  }
}