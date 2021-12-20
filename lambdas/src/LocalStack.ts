import fs from 'fs';
import { LambdaIntegration, RestApi } from '@aws-cdk/aws-apigateway';
import { Function, AssetCode, Runtime, Code } from '@aws-cdk/aws-lambda';
import { Bucket, IBucket } from '@aws-cdk/aws-s3';
import { Stack, App, StackProps, CfnOutput } from '@aws-cdk/core';
import { DynamoDbStack } from '../../infrastructure/stacks/dynamodb/Stack';

class LocalStack extends Stack {
  constructor(scope: App, id: string, props?: StackProps) {

    super(scope, id, props);
    const api = new RestApi(this, 'TestRestApi', {
      deployOptions: {
        stageName: process.env.STAGE ?? 'local',
      },
    });

    // Hot Swapping
    // const bucket = Bucket.fromBucketName(this, 'HotReloadingBucket', '__local__');

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
          })
          .addMethod(httpMethod,
            new LambdaIntegration(handler, { proxy: false, integrationResponses: [{ statusCode: '200' }, { statusCode: '400' }, { statusCode: '404' }] }),
            { methodResponses: [{ statusCode: '200' }, { statusCode: '400' }, { statusCode: '404' }] });

        new CfnOutput(this, `LocalLambdaEndpoint${lambdaName}`, {
          value: `http://localhost:4566/restapis/${api.restApiId}/local/_user_request_/${lambdaName}`,
        });
      });
    });

    // Adding OpenAPI which is a Lambda containing Swagger Documentation
    const openApi = new Function(this, 'OpenapiDocLambda', {
      runtime: Runtime.NODEJS_14_X,
      handler: 'docs.handler',
      code: Code.fromAsset('../docs', { exclude: ['node_modules', '*.ts', 'package.json'] }),
      environment: {
        API_GW_ID: api.restApiId,
        STAGE: 'local',
      },
    });
    api.root
      .addResource('openapi')
      .addProxy({
        defaultIntegration: new LambdaIntegration(openApi, { integrationResponses: [{ statusCode: '200' }, { statusCode: '404' }] }),
      });

    new CfnOutput(this, 'LocalSwaggerDocumentation', {
      description: 'Use the local Swagger',
      value: `http://localhost:4566/restapis/${api.restApiId}/local/_user_request_/openapi/index.html`,
    });
  }

  private buildSourceCode(bucket: IBucket, folder: string) {
    if (process.env.STAGE === undefined && process.env.LAMBDA_MOUNT_CWD) {
      return Code.fromBucket(bucket, `${process.env.LAMBDA_MOUNT_CWD}/${folder}`);
    }
    return new AssetCode(`dist/${folder}`);
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