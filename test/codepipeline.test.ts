import '@aws-cdk/assert/jest';
import { App, Construct, Stack, StackProps } from '@aws-cdk/core';
import { FourDPipelineStack } from '../src/stacks/codepipeline';

test('CodePipeline', () => {
  const app = new App();

  class ParentStack extends Stack {
    private pipelineStack;
    constructor(scope: Construct, id: string, props?: StackProps) {
      super(scope, id, props);

      this.pipelineStack = new FourDPipelineStack(this, 'test-pipeline');
    }

    public getPipelineStack() {
      return this.pipelineStack;
    }
  }

  const ps = new ParentStack(app, 'TestParentCodepipeline');
  const stack = ps.getPipelineStack();

  expect(stack).toHaveResource('AWS::CodeBuild::Project');
  expect(stack).toHaveResource('AWS::CodePipeline::Pipeline');
});