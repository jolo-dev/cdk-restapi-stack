import moment from 'moment';
import { v4 as uuid } from 'uuid';

export interface StandardAttribute {
  id?: string;
  creationDateTime?: string;
}

export interface I4DProject extends StandardAttribute {
  ProjectName: string;
  Author: string;
  Description: string;
  CoverImage: string;
  Season?: string;
  Phase?: string;
}

export class Project {
  readonly props: I4DProject;
  private id: string;
  private creationDateTime: string;
  constructor(props: I4DProject) {
    this.props = props;
    this.id = props.id ?? uuid();
    this.creationDateTime = props.creationDateTime ?? moment().format();
  }

  public getId() {
    return this.id;
  }

  public getCreationDateTime() {
    return this.creationDateTime;
  }

  public getProps() {
    return this.props;
  }
}