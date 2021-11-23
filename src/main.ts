import { App } from '@aws-cdk/core';
import { config } from 'dotenv';
import { CdkParentStack } from '../stacks/parent';

config();

// for development, use account/region from cdk cli
const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: 'eu-west-1',
};

const app = new App();
new CdkParentStack(app, 'FourDStack', { env, description: 'Parent Stack for deploying the whole infrastructure' });

app.synth();