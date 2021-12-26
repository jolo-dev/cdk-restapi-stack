import { StandardAttribute, Standard } from './StandardAttribute';

export interface I4DProject extends StandardAttribute {
  author?: string;
  description?: string;
  coverImage?: string;
  season?: string;
  phase?: string;
  tags?: string[];
}

/**
 * @swagger
 * components:
 *   requestBodies:
 *     Project_data:
 *       description: Request to add a new Project.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/Project/properties/props"
 *   schemas:
 *     Project:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         creationDateTime:
 *           type: string
 *         props:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *             author:
 *               type: string
 *             description:
 *               type: string
 *             coverImage:
 *               type: string
 *             season:
 *               $ref: "#/components/schemas/Season/properties/name"
 *             phase:
 *               $ref: "#/components/schemas/Phase/properties/name"
 *             tags:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/Tag/properties/name"
 */
export class Project extends Standard {

  readonly props: I4DProject;
  constructor(name: string, props: I4DProject, creationDateTime?: string) {
    super('Projects', name, creationDateTime);
    this.props = props;
  }

  public getProps() {
    return this.props;
  }
}