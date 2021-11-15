import { IRepository } from '@aws-cdk/aws-codecommit';
import { Artifact } from '@aws-cdk/aws-codepipeline';
import { CodeCommitSourceAction } from '@aws-cdk/aws-codepipeline-actions';

export class Source {
  private readonly repository: IRepository;
  private readonly sourceOutput: Artifact;

  constructor(repository: IRepository) {
    this.sourceOutput= new Artifact();
    this.repository = repository;
  }

  public getCodeCommitSourceAction = () : CodeCommitSourceAction => {
    return new CodeCommitSourceAction({
      actionName: 'Source-Action',
      output: this.sourceOutput,
      repository: this.repository,
    });
  };

  public getSourceOutput = () : Artifact => {
    return this.sourceOutput;
  };
}