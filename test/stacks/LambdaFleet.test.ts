import fs from 'fs';
import { Vpc, InterfaceVpcEndpoint } from '@aws-cdk/aws-ec2';
import { App } from '@aws-cdk/core';
import { LambdaFleet, Method } from '../../infrastructure/stacks/lambda-fleet/LambdaFleet';
import { PrivateApiGateway } from '../../infrastructure/stacks/lambda-fleet/PrivateApiGateway';

jest.mock('../../infrastructure/stacks/lambda-fleet/PrivateApiGateway');

jest.mock('@aws-cdk/aws-ec2', () => {
  return {
    Vpc: jest.fn(),
    InterfaceVpcEndpoint: jest.fn(),
  };
});

jest.mock('@aws-cdk/aws-lambda', () => {
  return {
    Function: jest.fn(),
    Runtime: jest.fn(),
    Code: { fromAsset: jest.fn() },
    Tracing: jest.fn(),
  };
});

describe('LambdaFleet', () => {

  const app = new App({
    context: {
      vpcId: 'vpc-123456789',
      privateSubnet1: 'private-subnet-1',
      privateSubnet2: 'private-subnet-2',
    },
  });

  const region = 'Buxtehude';
  const lambdaFolder = 'test/lambdas';
  const vpc = new Vpc(app, 'testVpc');
  const vpcEndpoint = [new InterfaceVpcEndpoint(app, 'VpcEndpoint', {
    service: {
      name: 'Foo',
      port: 443,
    },
    vpc,
  })];
  const api = new PrivateApiGateway(app, 'privateApiGatewayTest', { region, vpcEndpoint });

  beforeAll(() => {
    if (fs.existsSync(`${lambdaFolder}/dist`)) {
      fs.rmSync(`${lambdaFolder}/dist`, { recursive: true });
    }
  });

  const lambdaFleet = new LambdaFleet(app, 'TestLambdaFleet', {
    api,
    lambdaFolder,
    method: Method.GET,
    subnets: [],
    vpc,
  });

  it('should bundle the code', async () =>{
    await lambdaFleet.bundlingLambdas(Method.GET);
    // Need to put a timeout otherwise race condition.
    setTimeout(() => {
      expect(lambdaFleet.getAllLambdasFromFolder(`${lambdaFolder}/dist/get`))
        .toEqual(['assets.js']);
    }, 3000);
  });


  it('should return the folder of the built Lambdas', () => {
    expect(lambdaFleet.getAllLambdasFromFolder(`${lambdaFolder}/src/get`))
      .toEqual(['assets.ts']);
  });

  it('should throw when trying to bundle the folder', async () => {
    const spy = jest.spyOn(lambdaFleet, 'getAllLambdasFromFolder').mockReturnValue([]);
    await expect(lambdaFleet.bundlingLambdas(Method.GET)).rejects.toThrowError();
    spy.mockRestore();
  });


  it('should throw when folder not exists', () => {
    expect(() => lambdaFleet.getAllLambdasFromFolder('foo'))
      .toThrowError('Cannot find folder: foo');
  });

});