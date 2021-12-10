import { IPhase } from './Phase';
import { ISeason } from './Season';
import { StandardAttribute, Standard } from './StandardAttribute';
import { ITag } from './Tag';

export interface I4DProject extends StandardAttribute {
  ProjectName: string;
  Author: string;
  Description: string;
  CoverImage: string;
  Season?: ISeason;
  Phase?: IPhase;
  Tags?: ITag[];
}

export class Project extends Standard {

  readonly props: I4DProject;
  constructor(props: I4DProject) {
    super('Projects', props.ID, props.CreationDateTime);
    this.props = props;
  }

  public getProps() {
    return this.props;
  }
}