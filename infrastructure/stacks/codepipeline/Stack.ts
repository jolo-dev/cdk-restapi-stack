import { Repository } from '@aws-cdk/aws-codecommit';
import { Pipeline } from '@aws-cdk/aws-codepipeline';
import { CodeBuildProject } from '@aws-cdk/aws-events-targets';
import { Stack, Construct, StackProps } from '@aws-cdk/core';
import { Action } from './Action';
import { Source } from './Source';

export class FourDPipelineStack extends Stack {

  private readonly repositoryName: string;

  constructor(scope: Construct, id: string, repositoryName: string = '4dt-api-node', props?: StackProps) {
    super(scope, id, props);

    this.repositoryName = repositoryName;
    const repository = Repository.fromRepositoryName(this, `${id}-repository`, this.repositoryName);

    const codepipeline = new Pipeline(this, `${id}Pipeline`);
    // CodeCommit
    const source = new Source(repository);
    codepipeline.addStage({
      stageName: 'Source',
      actions: [source.getCodeCommitSourceAction()],
    });

    // Build
    const build = new Action(this, 'build',
      {
        install: {
          commands: ['npm install -g pnpm', 'pnpm install', 'pnpm projen'],
        },
        build: {
          commands: ['pnpm build'],
        },
      });

    const buildAction = build.buildAction(source.getSourceOutput(), 'build');

    codepipeline.addStage({
      stageName: 'ProjenBuild', // projens build includes testing and linting
      actions: [buildAction],
    });

    // Deploy
    const cdkDeploy = new Action(this, 'deploy',
      {
        install: {
          commands: ['npm install -g pnpm', 'pnpm install'],
        },
        post_build: {
          commands: ['pnpm deploy'],
        },
      });
    const cdkDeployAction = cdkDeploy.buildAction(source.getSourceOutput(), 'deploy');

    codepipeline.addStage({
      stageName: 'ProjenDeploy', // projens build includes testing and linting
      actions: [cdkDeployAction],
    });

    repository.onCommit('OnCommit', {
      target: new CodeBuildProject(build.getPipelineProject()),
    });
  }
}