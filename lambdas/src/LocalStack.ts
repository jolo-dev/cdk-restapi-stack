import fs from 'fs';
import { LambdaIntegration, RestApi } from '@aws-cdk/aws-apigateway';
import { Function, AssetCode, Runtime } from '@aws-cdk/aws-lambda';
import { Stack, App, StackProps } from '@aws-cdk/core';
import { DynamoDbStack } from '../../infrastructure/stacks/dynamodb/Stack';

class LocalStack extends Stack {
  constructor(scope: App, id: string, props?: StackProps) {
    super(scope, id, props);
    const api = new RestApi(this, 'TestRestApi');
    fs.readdirSync('dist').forEach(httpMethod => {
      fs.readdirSync(`dist/${httpMethod}`).forEach(lambda => {
        const lambdaName = lambda.replace('.js', '');
        const handler = new Function(this, `${httpMethod}${lambdaName}Function`, {
          code: new AssetCode(`dist/${httpMethod}`),
          handler: `${lambdaName}.handler`,
          runtime: Runtime.NODEJS_14_X,
          environment: {
            LOCAL: 'http://localhost:4566',
          },
        });
        api.root
          .addResource(lambdaName)
          .addMethod(httpMethod,
            new LambdaIntegration(handler, { proxy: false, integrationResponses: [{ statusCode: '200' }, { statusCode: '400' }, { statusCode: '404' }] }),
            { methodResponses: [{ statusCode: '200' }, { statusCode: '400' }, { statusCode: '404' }] });
      });
    });
  }
}

const app = new App();

new LocalStack(app, 'LocalStack');
new DynamoDbStack(app, 'DynamoDbLocal', {}, '../models');

app.synth();