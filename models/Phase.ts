import { Standard } from './StandardAttribute';

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
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *   schemas:
 *     Phase:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         creationDateTime:
 *           type: string
 */
export class Phase extends Standard {
  private props: any;
  constructor(name: string, props?: any, creationDateTime?: string) {
    super('Phases', name, creationDateTime);
    this.props = props;
  };

  public getProps() {
    return this.props;
  }
}