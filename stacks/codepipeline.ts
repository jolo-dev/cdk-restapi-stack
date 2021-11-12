import { IRepository } from '@aws-cdk/aws-codecommit';
import { Stack, Construct } from '@aws-cdk/core';
import { CodePipeline, CodePipelineSource, ShellStep } from '@aws-cdk/pipelines';

export class FourDPipelineStack extends Stack {
  constructor(scope: Construct, id: string, repository: IRepository) {
    super(scope, id, repository);

    const pipeline = new CodePipeline(this, 'Pipeline', {
      pipelineName: 'FourDPipeline',
      synth: new ShellStep('Synth', {
        input: CodePipelineSource.codeCommit(repository, 'master'),
        commands: ['npm i -g pnpm', 'pnpm install', 'pnpm projen', 'pnpm build'],
      }),
    });
  }
}