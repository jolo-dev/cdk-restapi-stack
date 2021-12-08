import fs from 'fs';
import path from 'path';
import { LambdaRestApi } from '@aws-cdk/aws-apigateway';
import * as lambda from '@aws-cdk/aws-lambda';
import { Stack, App } from '@aws-cdk/core';

class LocalStack extends Stack {
  constructor(scope: App, id: string) {
    super(scope, id);

    fs.readdirSync(path.resolve(__dirname, 'dist')).forEach(file => {
      console.log(file);
      //   const handler = new lambda.Function(this, 'handler', {
      //     code: new lambda.AssetCode(path.resolve(__dirname, 'dist')),
      //     handler: 'index.handler',
      //     runtime: lambda.Runtime.NODEJS_14_X,
      //   });

    //   new LambdaRestApi(this, 'LocalStackRestApi', {
    //     handler,
    //   });
    });


  }
}

const app = new App();

new LocalStack(app, 'Localstack');

app.synth();