import { Standard } from './StandardAttribute';


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
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *   schemas:
 *     Tag:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         creationDateTime:
 *           type: string
 */
export class Tag extends Standard {
  private props: any;
  constructor(name: string, props?: any, creationDateTime?: string) {
    super('Tags', name, creationDateTime);
    this.props = props;
  }

  public getProps() {
    return this.props;
  }
}