import fs from 'fs';
import { App, Construct, Stack, StackProps } from '@aws-cdk/core';
import { LambdaFleetStack } from '../stacks/lambdaFleet';

describe('lambdaFleetStack', () => {

  const app = new App({
    context: {
      vpcId: 'vpc-123456789',
      privateSubnet1: 'private-subnet-1',
      privateSubnet2: 'private-subnet-2',
    },
  });
  class ParentStack extends Stack {
    private lambdaFleetStack: LambdaFleetStack;
    private lambdaFolder: string;
    constructor(scope: Construct, id: string, lambdaFolder: string, props?: StackProps) {
      super(scope, id, props);
      this.lambdaFolder = lambdaFolder;
      this.lambdaFleetStack = new LambdaFleetStack(this, 'LambdaFleetTest', `test/${this.lambdaFolder}`);
    }

    public getLambdaFleetStack() {
      return this.lambdaFleetStack;
    }

    public getLambdaFolder() {
      return this.lambdaFolder;
    }
  }

  const ps = new ParentStack(app, 'ParentTest',
    'lambdas',
    {
      env: {
        account: '1234',
        region: 'Spain',
      },
      description: 'Parent Stack for deploying the whole infrastructure',
    });
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
      expect(lambdaFleetStack.getAllLambdasFromFolder(`${ps.getLambdaFolder()}/dist`)).toEqual(['assets.js']);
    }, 3000);
  });
  it('should return the folder of the built Lambdas', () => {
    expect(lambdaFleetStack.getAllLambdasFromFolder(`${ps.getLambdaFolder()}/src`)).toEqual(['assets.ts']);
  });

  // it('should throw when bundling lambdas is not possible', async () => {
  //   const foo = new ParentStack(app, 'FooBarStack', 'foo');
  //   const bar = foo.getLambdaFleetStack();
  //   await expect(bar.bundlingLambdas()).rejects.toThrow();
  // });

  //   it('should throw when trying to bundle the folder', async () => {
  //     const fooStack = new LambdaFleetStack(app, 'ThisThrows', 'foo');
  //     await expect(() => fooStack.bundlingLambdas()).rejects.toThrow();
  //   });

  it('should throw when folder not exists', () => {
    expect(() => lambdaFleetStack.getAllLambdasFromFolder('foo')).toThrowError('Cannot find folder: foo');
  });

});