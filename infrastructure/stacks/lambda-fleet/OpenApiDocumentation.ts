import fs from 'fs';
import path from 'path';
import { LambdaIntegration } from '@aws-cdk/aws-apigateway';
import { ISubnet, IVpc } from '@aws-cdk/aws-ec2';
import { Code, Function, Runtime } from '@aws-cdk/aws-lambda';
import { Construct, Stack } from '@aws-cdk/core';
import swaggerJsdoc from 'swagger-jsdoc';
import { PrivateApiGateway } from './PrivateApiGateway';

interface OpenApiDocumentationProps {
  api: PrivateApiGateway;
  vpc?: IVpc;
  subnets?: ISubnet[];
  vpcEndpointId?: string;
}
export class OpenApiDocumentation extends Construct {
  private api: PrivateApiGateway;
  private vpc?: IVpc;
  private subnets?: ISubnet[];
  private vpcEndpointId?: string;
  constructor(scope: Construct, id: string, props: OpenApiDocumentationProps) {
    super(scope, id);
    this.api = props.api;
    this.vpc = props.vpc;
    this.subnets = props.subnets;
    this.vpcEndpointId = props.vpcEndpointId;
    this.createOpenApiDocumentation();
    this.deployOpenApiLambda();
  }

  public deployOpenApiLambda() {
    const region = Stack.of(this).region;
    const account = Stack.of(this).account;
    // Adding OpenAPI which is a Lambda containing Swagger Documentation
    const openApi = new Function(this, 'OpenapiDocLambda', {
      runtime: Runtime.NODEJS_14_X,
      handler: 'docs.handler',
      code: Code.fromAsset(path.resolve(__dirname, '../../../docs'), { exclude: ['node_modules', '*.ts', 'package.json'] }),
      vpc: this.vpc,
      vpcSubnets: {
        subnets: this.subnets,
      },
      environment: {
        VPC_ENDPOINT_ID: this.vpcEndpointId ?? '',
        API_GW_ID: this.api.restApiId,
        REGION: region,
        STAGE: process.env.STAGE ?? 'dev',
        ACCOUNT: account,
      },
    });
    this.api.root
      .addResource('openapi')
      .addProxy({
        defaultIntegration: new LambdaIntegration(openApi, { integrationResponses: [{ statusCode: '200' }, { statusCode: '404' }] }),
      });
  }

  public createOpenApiDocumentation() {
    // Options for the swagger docs
    const options = {
      definition: {
        openapi: '3.0.1',
        info: {
          title: '4D- Asset Management',
          version: `${new Date().getFullYear()}-${new Date().getMonth() + 1}`,
          description: 'Assetmanagement for 4d',
        },
      },
      // Path to the API docs
      // Note that this path is relative to the current directory from which the Node.js is ran, not the application itself.
      apis: [path.resolve(__dirname, '../../../lambdas/src/**/*.ts'), path.resolve(__dirname, '../../../models/*.ts')],
    };
    const openapi = swaggerJsdoc(options);
    fs.writeFileSync(path.resolve(__dirname, '../../../docs/openapi/openapi.json'), JSON.stringify(openapi, null, 2));
  };

}