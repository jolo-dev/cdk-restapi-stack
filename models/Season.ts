import { StandardAttribute, Standard } from './StandardAttribute';

export interface ISeason extends StandardAttribute {
  SeasonName: string;
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
 *         ID:
 *           type: string
 *         CreationDateTime:
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
    super('Seasons', props.ID, props.CreationDateTime);
    this.props = props;
  };
  public getProps() {
    return this.props;
  }
}