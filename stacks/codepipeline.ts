import { Repository } from '@aws-cdk/aws-codecommit';
import { Pipeline } from '@aws-cdk/aws-codepipeline';
import { CodeBuildProject } from '@aws-cdk/aws-events-targets';
import { Stack, Construct, StackProps } from '@aws-cdk/core';
import { BuildStage } from '../src/BuildStage';
import { SourceStage } from '../src/SourceStage';

export class FourDPipelineStack extends Stack {

  private readonly repositoryArn: string;

  constructor(scope: Construct, id: string, repositoryArn: string = '4dt-api-node', props?: StackProps) {
    super(scope, id, props);

    this.repositoryArn = repositoryArn;
    const codepipeline = new Pipeline(this, `${id}Pipeline`);
    const repository = Repository.fromRepositoryName(this, `${id}-repository`, this.repositoryArn);

    // CodeCommit
    const source = new SourceStage(repository);
    codepipeline.addStage({
      stageName: 'Source',
      actions: [source.getCodeCommitSourceAction()],
    });

    // Build
    const build = new BuildStage(this, 'build',
      {
        install: {
          commands: ['npm install -g pnpm', 'pnpm install'],
        },
        build: {
          commands: ['pnpm build'],
        },
      });

    const buildAction = build.buildAction(source.getSourceOutput(), 'build');

    // Deploy
    const cdkDeploy = new BuildStage(this, 'deploy',
      {
        post_build: {
          commands: ['pnpm deploy'],
        },
      });
    const cdkDeployAction = cdkDeploy.buildAction(source.getSourceOutput(), 'deploy');

    codepipeline.addStage({
      stageName: 'ProjenBuild', // projens build includes testing and linting
      actions: [buildAction, cdkDeployAction],
    });

    repository.onCommit('OnCommit', {
      target: new CodeBuildProject(build.getPipelineProject()),
    });
  }
}