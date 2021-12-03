import { App, Construct, Stack, StackProps } from '@aws-cdk/core';
import { DynamoDbStack } from '../../src/stacks/dynamodb/Stack';

describe('DynamoDBStack', () =>{

  const env = {
    account: '123456789010',
    region: 'eu-west-1',
    description: 'Parent Stack for deploying the whole infrastructure',
  };

  class ParentStack extends Stack {
    private dynamoDbStack: DynamoDbStack;
    constructor(scope: Construct, id: string, props: StackProps) {
      super(scope, id, props);
      this.dynamoDbStack = new DynamoDbStack(this, `${id}DynamoDbTest`);
    }

    public getLambdaFleetStack() {
      return this.dynamoDbStack;
    }
  }

  const noContext = new App();

  it('should create a DynamoDbStack', async () => {
    new ParentStack(noContext, 'Foo', { env });
  });
});