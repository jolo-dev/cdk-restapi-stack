import { StandardAttribute, Standard } from './StandardAttribute';

export interface I4DProject extends StandardAttribute {
  ProjectName: string;
  Author: string;
  Description: string;
  CoverImage: string;
  Season?: string;
  Phase?: string;
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