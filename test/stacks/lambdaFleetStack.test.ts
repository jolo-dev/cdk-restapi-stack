import { StringParameter } from '@aws-cdk/aws-ssm';
import { App, Construct, Stack, StackProps } from '@aws-cdk/core';
import { LambdaFleetStack } from '../../src/stacks/lambda-fleet/Stack';
describe('lambdaFleet', () => {

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

  // const ps = new ParentStack(app, 'ParentTest', 'lambdas', { env });
  // const lambdaFleetStack = ps.getLambdaFleetStack();

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