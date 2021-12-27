
import { Template } from '@aws-cdk/assertions';
import { Vpc, InterfaceVpcEndpoint } from '@aws-cdk/aws-ec2';
import { App, Stack } from '@aws-cdk/core';
import { OpenApiDocumentation } from '../../infrastructure/stacks/lambda-fleet/OpenApiDocumentation';
import { PrivateApiGateway } from '../../infrastructure/stacks/lambda-fleet/PrivateApiGateway';
describe('OpenApiDocumentation', () => {
  process.env.CDK_DEFAULT_ACCOUNT = undefined;
  process.env.STAGE = 'test';
  const app = new App();
  test('should create a Lambda for the OpenApiDocumentation', () => {
    const stack = new Stack(app, 'TestStackOpenApiLambda');

    // Mocks
    const vpc = new Vpc(stack, 'TestOpenApiDocumentationVpc');
    const vpcEndpoint = [new InterfaceVpcEndpoint(stack, 'VpcEndpointInOpenApi', {
      service: {
        name: 'Foo',
        port: 443,
      },
      vpc,
    })];
    const api = new PrivateApiGateway(stack, 'privateApiGatewayTest', { region: 'foo', vpcEndpoint });
    api.root.addMethod('get');

    new OpenApiDocumentation(stack, 'OpenApiDocumentationTest', { api });
    const template = Template.fromStack(stack);
    template.resourceCountIs('AWS::Lambda::Function', 1);
  });
});