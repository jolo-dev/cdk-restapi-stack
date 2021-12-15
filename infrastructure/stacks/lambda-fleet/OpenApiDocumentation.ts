import fs from 'fs';
import { CfnDocumentationPart, CfnDocumentationPartProps, LambdaIntegration } from '@aws-cdk/aws-apigateway';
import { ISubnet, IVpc } from '@aws-cdk/aws-ec2';
import { Code, Function, Runtime } from '@aws-cdk/aws-lambda';
import { Construct } from '@aws-cdk/core';
import swaggerJsdoc from 'swagger-jsdoc';
import { PrivateApiGateway } from './PrivateApiGateway';


type DocumentationProps = Omit<CfnDocumentationPartProps, 'location' | 'properties' | 'restApiId'> & {
  method: string;
  lambdaName: string;
}

const account = process.env.CDK_DEFAULT_ACCOUNT ?? '';
const region = process.env.AWS_REGION ?? 'eu-west-1';

export class OpenApiDocumentation extends Construct {
  private api: PrivateApiGateway;
  private vpc: IVpc;
  private subnets: ISubnet[];
  private vpcEndpointId: string;
  constructor(scope: Construct, id: string, api: PrivateApiGateway, vpc: IVpc, subnets: ISubnet[], vpcEndpointId: string) {
    super(scope, id);
    this.api = api;
    this.vpc = vpc;
    this.subnets = subnets;
    this.vpcEndpointId = vpcEndpointId;
    this.createOpenApiDocumentation();
    this.deployOpenApiLambda();
  }

  public deployOpenApiLambda() {
    // Adding OpenAPI which is a Lambda containing Swagger Documentation
    const openApi = new Function(this, 'OpenapiDocLambda', {
      runtime: Runtime.NODEJS_14_X,
      handler: 'docs.handler',
      code: Code.fromAsset('docs', { exclude: ['node_modules', '*.ts', 'package.json'] }),
      vpc: this.vpc,
      vpcSubnets: {
        subnets: this.subnets,
      },
      environment: {
        VPC_ENDPOINT_ID: this.vpcEndpointId,
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
          version: '2021-12',
          description: 'Assetmanagement for 4d',
        },
      },
      // Path to the API docs
      // Note that this path is relative to the current directory from which the Node.js is ran, not the application itself.
      apis: ['./lambdas/src/**/*.ts', './models/*.ts'],
    };
    const openapi = swaggerJsdoc(options);
    fs.writeFileSync('docs/openapi.json', JSON.stringify(openapi, null, 2));
  };

  public createCfnDocumentationParts(props: DocumentationProps) {
    // DocumentationPart for API GW but frankly they are pretty useless.
    // Could remove them.
    new CfnDocumentationPart(this, `${props.method}${props.lambdaName}ResourceDoc`, {
      location: {
        path: `/${props.lambdaName}`,
        type: 'RESOURCE',
      },
      properties: `{\"description\": \"Ressource: ${props.lambdaName}\"}`,
      restApiId: this.api.restApiId,
    });

    new CfnDocumentationPart(this, `${props.method}${props.lambdaName}MethodDoc`, {
      location: {
        method: props.method,
        path: `/${props.lambdaName}`,
        type: 'METHOD',
      },
      properties: props.method === 'post'
        ? `{\"description\": \"${props.method.toUpperCase()}-Method for adding ${props.lambdaName}\"}`
        : `{\"description\": \"${props.method.toUpperCase()}-Method for Getting a list of ${props.lambdaName}s\"}`,
      restApiId: this.api.restApiId,
    });

    new CfnDocumentationPart(this, `${props.method}${props.lambdaName}ResponseBodySuccessDoc`, {
      location: {
        method: props.method,
        path: `/${props.lambdaName}`,
        type: 'RESPONSE_BODY',
        statusCode: '200',
      },
      properties: props.method === 'post'
        ? `{\"description\": \"${props.lambdaName} has been successfully added\"}`
        : '{\"description\": \"success\"}',
      restApiId: this.api.restApiId,
    });

    new CfnDocumentationPart(this, `${props.method}${props.lambdaName}ResponseSuccessDoc`, {
      location: {
        method: props.method,
        path: `/${props.lambdaName}`,
        type: 'RESPONSE',
        statusCode: '200',
      },
      properties: props.method === 'post'
        ? `{\"description\": \"Status code when ${props.lambdaName} had been successfully added\"}`
        : `{\"description\": \"Status code when Getting a list of ${props.lambdaName}s successfully\"}`,
      restApiId: this.api.restApiId,
    });

    new CfnDocumentationPart(this, `${props.method}${props.lambdaName}ResponseBodyFailedDoc`, {
      location: {
        method: props.method,
        path: `/${props.lambdaName}`,
        type: 'RESPONSE_BODY',
        statusCode: '400',
      },
      properties: props.method === 'post'
        ? '{\"description\": \"The post body is empty or corrupt\"}'
        : `{\"description\": \"Error in Getting ${props.lambdaName}\"}`,
      restApiId: this.api.restApiId,
    });

    new CfnDocumentationPart(this, `${props.method}${props.lambdaName}ResponseFailedDoc`, {
      location: {
        method: props.method,
        path: `/${props.lambdaName}`,
        type: 'RESPONSE',
        statusCode: '400',
      },
      properties: props.method === 'post'
        ? `{\"description\": \"Status code when ${props.lambdaName} was not successfully added\"}`
        : `{\"description\": \"Status code when Getting a list of ${props.lambdaName}s has failed\"}`,
      restApiId: this.api.restApiId,
    });
  }
}