import { App } from '@aws-cdk/core';
import { config } from 'dotenv';
import { FourDPipelineStack } from '../stacks/codepipeline';
// import { PipelineStack } from '../stacks/pipeline';

config();

// for development, use account/region from cdk cli
const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: 'eu-west-1',
};

const app = new App();

const repositoryArn = process.env.GIT_REPOSITORY ?? '4dt-api-node';

new FourDPipelineStack(app, 'four-d-pipeline', repositoryArn, { env, description: 'Pipeline consist of CodeCommit, CodeBuild, CodeDeploy(Soon)' });
// new PipelineStack(app, 'four-d-pipeline', repositoryArn, { env, description: 'Pipeline consist of CodeCommit, CodeBuild, CodeDeploy(Soon)' });
app.synth();