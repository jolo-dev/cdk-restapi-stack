import fs from 'fs';
import { LambdaRestApi } from '@aws-cdk/aws-apigateway';
import { Function, AssetCode, Runtime } from '@aws-cdk/aws-lambda';
import { Stack, App } from '@aws-cdk/core';

class LocalStack extends Stack {
  constructor(scope: App, id: string) {
    super(scope, id);

    fs.readdirSync('dist').forEach(httpMethod => {
      fs.readdirSync(`dist/${httpMethod}`).forEach(lambda => {
        const lambdaName = lambda.replace('.js', '');
        const handler = new Function(this, `${httpMethod}${lambdaName}Function`, {
          code: new AssetCode(`dist/${httpMethod}`),
          handler: `${lambdaName}.handler`,
          runtime: Runtime.NODEJS_14_X,
        });

        new LambdaRestApi(this, `${httpMethod}${lambdaName}RestApi`, {
          handler,
        });
      });
    });
  }
}

const app = new App();

new LocalStack(app, 'Localstack');

app.synth();