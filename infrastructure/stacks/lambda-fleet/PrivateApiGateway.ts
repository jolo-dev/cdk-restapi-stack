import { EndpointType, MethodLoggingLevel, RestApi } from '@aws-cdk/aws-apigateway';
import { IVpcEndpoint } from '@aws-cdk/aws-ec2';
import { PolicyDocument, PolicyStatement, AnyPrincipal, Effect } from '@aws-cdk/aws-iam';
import { CfnOutput, Construct } from '@aws-cdk/core';

interface PrivateApiGatewayProps {
  description?: string;
  vpcEndpoint: IVpcEndpoint[];
  region: string;
  stage?: string;
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
              'aws:sourceVpce': props.vpcEndpoint[0].vpcEndpointId, // should be just one VPC Endpoint for API GW
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
        stageName: props.stage ?? 'dev',
        loggingLevel: MethodLoggingLevel.INFO,
        dataTraceEnabled: true,
      },
      endpointConfiguration: {
        types: [EndpointType.PRIVATE],
        vpcEndpoints: props.vpcEndpoint,
      },
      policy: apiResourcePolicy,
    });

    new CfnOutput(this, 'CfnApiUrl', { value: this.url });
    new CfnOutput(this, 'CfnPrivateRestApi', { value: this.restApiId });
  }
}