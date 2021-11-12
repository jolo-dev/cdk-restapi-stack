import { Repository } from '@aws-cdk/aws-codecommit';
import { App } from '@aws-cdk/core';
import { FourDPipelineStack } from '../stacks/codepipeline';

// for development, use account/region from cdk cli
const devEnv = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};

const repositoryArn = process.env.GIT_REPOSITORY ?? '4dt-api-node';

const app = new App();

const repository = Repository.fromRepositoryName(app, 'four-d-repository', repositoryArn);
new FourDPipelineStack(app, 'four-d-pipeline', repository);
// new MyStack(app, 'my-stack-prod', { env: prodEnv });

app.synth();