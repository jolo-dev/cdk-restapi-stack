import { StandardAttribute, Standard } from './StandardAttribute';

export interface ISeason extends StandardAttribute {
  seasonName: string;
}

/**
 * @swagger
 * components:
 *   requestBodies:
 *     Season_data:
 *       description: Request to add a new Season.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/Season"
 *   schemas:
 *     Season:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         creationDateTime:
 *           type: string
 *         props:
 *           type: object
 *           properties:
 *             SeasonName:
 *               type: string
 */
export class Season extends Standard {

  readonly props: ISeason;
  constructor(props: ISeason) {
    super('Seasons', props.id, props.creationDateTime);
    this.props = props;
  };
  public getProps() {
    return this.props;
  }
}