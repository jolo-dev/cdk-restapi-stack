import { PipelineProject, BuildSpec, LinuxBuildImage } from '@aws-cdk/aws-codebuild';
import { Artifact } from '@aws-cdk/aws-codepipeline';
import { CodeBuildAction } from '@aws-cdk/aws-codepipeline-actions';
import { Stack } from '@aws-cdk/core';

export enum BuildPhase {
  INSTALL = 'install',
  PRE_BUILD = 'pre_build',
  POST_BUILD = 'post_build',
  BUILD = 'build'
}

type Command = {
  [key in BuildPhase]?: {
    commands: string[];
  };
};

export class BuildStage {

  private stack : Stack;
  private pipelineProject: PipelineProject;
  private readonly buildOutput: Artifact;

  constructor(stack: Stack, id: string, command: Command) {
    this.stack = stack;
    this.buildOutput = new Artifact();

    this.pipelineProject = new PipelineProject(stack, `${this.stack.artifactId}-${id}-CodeCommitProject`, {
      environment: {
        buildImage: LinuxBuildImage.STANDARD_5_0,
      },
      buildSpec: BuildSpec.fromObject({
        version: '0.2',
        phases: command,
      }),
    });
  }

  public buildAction = (sourceInput: Artifact) : CodeBuildAction => {
    return new CodeBuildAction({
      actionName: 'CodeBuild',
      project: this.pipelineProject,
      input: sourceInput,
    });
  };

  public getSourceOutput = (): Artifact => {
    return this.buildOutput;
  };

  public getPipelineProject = () : PipelineProject => {
    return this.pipelineProject;
  };
}