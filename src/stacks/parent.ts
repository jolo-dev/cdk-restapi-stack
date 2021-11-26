import { Construct, Stack, StackProps } from '@aws-cdk/core';
import { FourDPipelineStack } from './codepipeline';
import { LambdaFleetStack } from './lambdaFleet';


export class CdkParentStack extends Stack {
  constructor(scope: Construct, id: string, repositoryName: string, props?: StackProps) {
    super(scope, id, props);

    new FourDPipelineStack(this, 'FourDPipelineStack', repositoryName);
    new LambdaFleetStack(this, 'LambdaFleetStack', 'lambdas');
  }
}