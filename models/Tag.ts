import { StandardAttribute, Standard } from './StandardAttribute';

export interface ITag extends StandardAttribute {
  Name: string;
}

/**
 * @swagger
 * components:
 *   requestBodies:
 *     Tag_data:
 *       description: Request to add a new Tag.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/Tag"
 *   schemas:
 *     Tag:
 *       type: object
 *       properties:
 *         ID:
 *           type: string
 *         CreationDateTime:
 *           type: string
 *         props:
 *           type: object
 *           properties:
 *             Name:
 *               type: string
 */
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