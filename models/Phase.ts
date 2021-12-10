import { StandardAttribute, Standard } from './StandardAttribute';

export interface IPhase extends StandardAttribute {
  PhaseName: string;
}

export class Phase extends Standard {

  readonly props: IPhase;
  constructor(props: IPhase) {
    super('Phases', props.ID, props.CreationDateTime);
    this.props = props;
  };
  public getProps() {
    return this.props;
  }
}