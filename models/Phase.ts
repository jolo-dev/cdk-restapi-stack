import { Standard } from './StandardAttribute';

/**
 * @swagger
 * components:
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