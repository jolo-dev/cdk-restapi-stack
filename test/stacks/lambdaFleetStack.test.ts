import fs from 'fs';
import { StringParameter } from '@aws-cdk/aws-ssm';
import { App, Construct, Stack, StackProps } from '@aws-cdk/core';
import { LambdaFleetStack } from '../../src/stacks/lambda-fleet/Stack';
describe('lambdaFleetStack', () => {

  const app = new App({
    context: {
      vpcId: 'vpc-123456789',
      privateSubnet1: 'private-subnet-1',
      privateSubnet2: 'private-subnet-2',
    },
  });

  const env = {
    account: '123456789010',
    region: 'eu-west-1',
    description: 'Parent Stack for deploying the whole infrastructure',
  };
  class ParentStack extends Stack {
    private lambdaFleetStack: LambdaFleetStack;
    private lambdaFolder: string;
    constructor(scope: Construct, id: string, lambdaFolder: string, props: StackProps) {
      super(scope, id, props);
      this.lambdaFolder = lambdaFolder;
      this.lambdaFleetStack = new LambdaFleetStack(this, `${id}LambdaFleetTest`);
    }

    public getLambdaFleetStack() {
      return this.lambdaFleetStack;
    }

    public getLambdaFolder() {
      return this.lambdaFolder;
    }
  }

  const ps = new ParentStack(app, 'ParentTest', 'lambdas', { env });
  const lambdaFleetStack = ps.getLambdaFleetStack();

  beforeAll(() => {
    if (fs.existsSync(`test/${ps.getLambdaFolder()}/dist`)) {
      fs.rmSync(`test/${ps.getLambdaFolder()}/dist`, { recursive: true });
    }
  });

  it('should bundle the code', async () => {
    await lambdaFleetStack.bundlingLambdas();
    // Need to put a timeout otherwise race condition.
    setTimeout(() => {
      expect(lambdaFleetStack.getAllLambdasFromFolder(`${ps.getLambdaFolder()}/dist`))
        .toEqual(['assets.js']);
    }, 3000);
  });
  it('should return the folder of the built Lambdas', () => {
    expect(lambdaFleetStack.getAllLambdasFromFolder(`${ps.getLambdaFolder()}/src`))
      .toEqual(['assets.ts']);
  });

  it('should throw when trying to bundle the folder', async () => {
    const spy = jest.spyOn(lambdaFleetStack, 'getAllLambdasFromFolder').mockReturnValue([]);
    await expect(lambdaFleetStack.bundlingLambdas()).rejects.toThrowError();
    spy.mockRestore();
  });

  it('should throw when folder not exists', () => {
    expect(() => lambdaFleetStack.getAllLambdasFromFolder('foo'))
      .toThrowError('Cannot find folder: foo');
  });

  it('should stub SSM Parameter Store when no context', async () => {
    const noContext = new App();
    const spyStringparameter =
      jest.spyOn(StringParameter, 'valueForStringParameter')
        .mockReturnValue('foo')
        .mockReturnValueOnce('bar')
        .mockReturnValueOnce('baz');

    new ParentStack(noContext, 'Foo', 'lambdas', { env });

    expect(spyStringparameter).toBeCalledTimes(3);
    spyStringparameter.mockRestore();
  });

});