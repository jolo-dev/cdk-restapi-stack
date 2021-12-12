import { StringParameter } from '@aws-cdk/aws-ssm';
import { App } from '@aws-cdk/core';
import { LambdaFleetStack } from '../../infrastructure/stacks/lambda-fleet/Stack';
describe('lambdaFleet', () => {

  const env = {
    account: '123456789010',
    region: 'eu-west-1',
    description: 'Parent Stack for deploying the whole infrastructure',
  };

  it('should stub SSM Parameter Store when no context', async () => {
    const noContext = new App();
    const spyStringparameter =
      jest.spyOn(StringParameter, 'valueForStringParameter')
        .mockReturnValue('foo')
        .mockReturnValueOnce('bar')
        .mockReturnValueOnce('baz');

    new LambdaFleetStack(noContext, 'Foo', 'lambdas', { env });

    expect(spyStringparameter).toBeCalledTimes(3);
    spyStringparameter.mockRestore();
  });

});