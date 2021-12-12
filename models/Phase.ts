import { StandardAttribute, Standard } from './StandardAttribute';

export interface IPhase extends StandardAttribute {
  PhaseName: string;
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
 *             $ref: "#/components/schemas/Phase"
 *   schemas:
 *     Phase:
 *       type: object
 *       properties:
 *         ID:
 *           type: string
 *         CreationDateTime:
 *           type: string
 *         props:
 *           type: object
 *           properties:
 *             PhaseName:
 *               type: string
 */
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