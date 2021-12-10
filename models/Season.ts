import { StandardAttribute, Standard } from './StandardAttribute';

export interface ISeason extends StandardAttribute {
  SeasonName: string;
  AnotherAttribute: string;
}

export class Season extends Standard {

  readonly props: ISeason;
  constructor(props: ISeason) {
    super('Seasons', props.ID, props.CreationDateTime);
    this.props = props;
  };
  public getProps() {
    return this.props;
  }
}