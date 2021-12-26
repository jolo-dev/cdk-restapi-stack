import { Standard } from './StandardAttribute';

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
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *   schemas:
 *     Season:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         creationDateTime:
 *           type: string
 */
export class Season extends Standard {
  private props: any;
  constructor(name: string, props?: any, creationDateTime?: string) {
    super('Seasons', name, creationDateTime);
    this.props = props;
  };

  public getProps() {
    return this.props;
  }
}