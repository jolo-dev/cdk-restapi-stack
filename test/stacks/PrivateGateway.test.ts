import { Template } from '@aws-cdk/assertions';
import { InterfaceVpcEndpoint, Vpc } from '@aws-cdk/aws-ec2';
import { App, Stack } from '@aws-cdk/core';
import { PrivateApiGateway } from '../../infrastructure/stacks/lambda-fleet/PrivateApiGateway';

jest.mock('@aws-cdk/aws-ec2', () => {
  return {
    Vpc: jest.fn(),
    InterfaceVpcEndpoint: jest.fn(),
  };
});

describe('PrivateGateway', () => {
  const app = new App();
  const vpc = new Vpc(app, 'TestVpcInPrivateGateway');
  const vpcEndpoint = [new InterfaceVpcEndpoint(app, 'VpcEndpointInPrivateGateway', {
    service: {
      name: 'Foo',
      port: 443,
    },
    vpc,
  })];

  test('should create a PrivateGateway', () => {
    const stack = new Stack(app, 'TestStack');
    const api = new PrivateApiGateway(stack, 'TestScopedPrivatApiGateway', {
      region: 'foo',
      vpcEndpoint,
      stage: 'test',
    });
    api.root.addMethod('get');
    const template = Template.fromStack(stack);
    template.resourceCountIs('AWS::ApiGateway::RestApi', 1);
    template.hasResourceProperties('AWS::ApiGateway::RestApi', {
      EndpointConfiguration: {
        Types: [
          'PRIVATE',
        ],
      },
    });
  });
});