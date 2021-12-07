import { StandardAttribute, Standard } from './StandardAttribute';

export interface ITag extends StandardAttribute {
  Name: string;
}

export class Tag extends Standard {

  readonly props: ITag;
  constructor(props: ITag) {
    super('Tags', props.ID, props.CreationDateTime);
    this.props = props;
  }

  public getProps() {
    return this.props;
  }
}