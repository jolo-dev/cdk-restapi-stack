import { EndpointType, RestApi } from '@aws-cdk/aws-apigateway';
import { IVpcEndpoint } from '@aws-cdk/aws-ec2';
import { PolicyDocument, PolicyStatement, AnyPrincipal, Effect } from '@aws-cdk/aws-iam';
import { CfnOutput, Construct } from '@aws-cdk/core';

interface PrivateApiGatewayProps {
  description?: string;
  vpcEndpoint: IVpcEndpoint[];
  region: string;
}

export class PrivateApiGateway extends RestApi {
  constructor(scope: Construct, id: string, props: PrivateApiGatewayProps) {

    const apiResourcePolicy = new PolicyDocument({
      statements: [
        new PolicyStatement({
          sid: 'AllowVPCEndpointToInvoke',
          effect: Effect.ALLOW,
          actions: ['execute-api:Invoke'],
          principals: [new AnyPrincipal()],
          resources: ['execute-api:/*/*/*'],
          conditions: {
            StringEquals: {
              'aws:sourceVpce': 'vpce-01988d3d83bebbf0e',
            },
          },
        }),
        new PolicyStatement({
          sid: 'InvokeLambda',
          effect: Effect.ALLOW,
          actions: ['lambda:InvokeFunction'],
          principals: [new AnyPrincipal()],
          resources: ['lambda.amazonaws.com'],
        }),
      ],
    });

    super(scope, id, {
      cloudWatchRole: true,
      description: props.description,
      deployOptions: {
        stageName: process.env.STAGE ?? 'dev',
      },
      endpointConfiguration: {
        types: [EndpointType.PRIVATE],
        vpcEndpoints: props.vpcEndpoint,
      },
      policy: apiResourcePolicy,
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

    this.createCfnOutputs();
  }

  private createCfnOutputs() {
    new CfnOutput(this, 'CfnApiUrl', { value: this.url });
  }
}