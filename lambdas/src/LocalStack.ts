import fs from 'fs';
import { LambdaIntegration, RestApi } from '@aws-cdk/aws-apigateway';
import { Function, AssetCode, Runtime, Code } from '@aws-cdk/aws-lambda';
import { Stack, App, StackProps, CfnOutput } from '@aws-cdk/core';
import { DynamoDbStack } from '../../infrastructure/stacks/dynamodb/Stack';
import { OpenApiDocumentation } from '../../infrastructure/stacks/lambda-fleet/OpenApiDocumentation';

class LocalStack extends Stack {
  constructor(scope: App, id: string, props?: StackProps) {

    super(scope, id, props);
    const api = new RestApi(this, 'TestRestApi', {
      deployOptions: {
        stageName: process.env.STAGE ?? 'local',
      },
    });

    new OpenApiDocumentation(this, 'LocalOpenApiDocumentation', {
      api,
    });

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

        const resource = api.root.getResource(lambdaName) ?? api.root
          .addResource(lambdaName, {
            // 👇 set up CORS
            defaultCorsPreflightOptions: {
              allowHeaders: [
                'Content-Type',
                'X-Amz-Date',
                'Authorization',
                'X-Api-Key',
              ],
              allowMethods: ['OPTIONS', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
              allowCredentials: true,
              allowOrigins: ['*'],
            },
          });

        resource.addMethod(httpMethod,
          new LambdaIntegration(handler, { proxy: true, integrationResponses: [{ statusCode: '200' }, { statusCode: '400' }] }),
          { methodResponses: [{ statusCode: '200' }, { statusCode: '400' }] });

        new CfnOutput(this, `LocalLambdaEndpoint${httpMethod.toUpperCase()}${lambdaName}`, {
          value: `http://localhost:4566/restapis/${api.restApiId}/local/_user_request_/${lambdaName}`,
        });
      });
    });

    new CfnOutput(this, 'LocalSwaggerDocumentation', {
      description: 'Use the local Swagger',
      value: `http://localhost:4566/restapis/${api.restApiId}/local/_user_request_/openapi/index.html`,
    });
  }
}

const app = new App();

const env = {
  account: '000000000000',
  region: 'eu-west-1',
};

new LocalStack(app, 'LocalStack', { env });
new DynamoDbStack(app, 'DynamoDbLocal', { env }, '../models');

app.synth();