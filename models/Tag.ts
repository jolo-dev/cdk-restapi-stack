import { StandardAttribute, Standard } from './StandardAttribute';

export interface ITag extends StandardAttribute {
  name: string;
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
 *             $ref: "#/components/schemas/Tag/properties/props"
 *   schemas:
 *     Tag:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         creationDateTime:
 *           type: string
 *         props:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 */
export class Tag extends Standard {

  readonly props: ITag;
  constructor(props: ITag) {
    super('Tags', props.id);
    this.props = props;
  }

  public getProps() {
    return this.props;
  }
}