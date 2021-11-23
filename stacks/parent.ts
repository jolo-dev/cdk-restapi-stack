import { Construct, Stack, StackProps } from '@aws-cdk/core';
import { FourDPipelineStack } from './codepipeline';
import { LambdaFleetStack } from './lambdaFleet';

const repositoryName = process.env.GIT_REPOSITORY ?? '4dt-api-node';
export class CdkParentStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    new FourDPipelineStack(this, 'FourDPipelineStack', repositoryName);
    new LambdaFleetStack(this, 'LambdaFleetStack', 'lambdas');
  }
}