import { App } from '@aws-cdk/core';
import { config } from 'dotenv';
import { CdkParentStack } from '../stacks/parent';

config();


const app = new App();
new CdkParentStack(app, 'FourDStack');

app.synth();