import '@aws-cdk/assert/jest';
import { App } from '@aws-cdk/core';
import { FourDPipelineStack } from '../stacks/codepipeline';

test('CodePipeline', () => {
  const app = new App();

  const stack = new FourDPipelineStack(app, 'test-pipeline');

  expect(stack).toHaveResource('AWS::CodeBuild::Project');
  expect(stack).toHaveResource('AWS::CodePipeline::Pipeline');

  expect(app.synth().getStackArtifact(stack.artifactId).template).toMatchSnapshot();
});