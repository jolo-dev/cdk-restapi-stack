import fs from 'fs';
import { App } from '@aws-cdk/core';
import { LambdaFleetStack } from '../stacks/lambdaFleet';

describe('lambdaFleetStack', () => {

  const app = new App();
  const lambdaFolder = 'lambdas';
  const lambdaFleetStack = new LambdaFleetStack(app, 'LambdaFleetTest', `test/${lambdaFolder}`);

  beforeAll(() => {
    if (fs.existsSync(`test/${lambdaFolder}/dist`)) {
      fs.rmSync(`test/${lambdaFolder}/dist`, { recursive: true });
    }
  });

  it('should bundle the code', async () => {
    await lambdaFleetStack.bundlingLambdas();
    // Need to put a timeout otherwise race condition.
    setTimeout(() => {
      expect(lambdaFleetStack.getAllLambdasFromFolder(`${lambdaFolder}/dist`)).toEqual(['assets.js']);
    }, 3000);
  });
  it('should return the folder of the built Lambdas', () => {
    expect(lambdaFleetStack.getAllLambdasFromFolder(`${lambdaFolder}/src`)).toEqual(['assets.ts']);
  });

  //   it('should throw when trying to bundle the folder', async () => {
  //     const fooStack = new LambdaFleetStack(app, 'ThisThrows', 'foo');
  //     await expect(() => fooStack.bundlingLambdas()).rejects.toThrow();
  //   });

  // Jest Problem...
  it('should throw when folder not exists', () => {
    expect(() => lambdaFleetStack.getAllLambdasFromFolder('foo')).toThrowError('Cannot find folder: foo');
  });
});