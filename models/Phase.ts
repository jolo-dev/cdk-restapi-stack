import { StandardAttribute, Standard } from './StandardAttribute';

export interface IPhase extends StandardAttribute {
  phaseName: string;
}
/**
 * @swagger
 * components:
 *   requestBodies:
 *     Phase_data:
 *       description: Request to add a new Phase.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/Phase/properties/props"
 *   schemas:
 *     Phase:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         creationDateTime:
 *           type: string
 *         props:
 *           type: object
 *           properties:
 *             phaseName:
 *               type: string
 */
export class Phase extends Standard {

  readonly props: IPhase;
  constructor(props: IPhase) {
    super('Phases', props.id);
    this.props = props;
  };
  public getProps() {
    return this.props;
  }
}