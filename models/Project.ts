import { IPhase } from './Phase';
import { ISeason } from './Season';
import { StandardAttribute, Standard } from './StandardAttribute';
import { ITag } from './Tag';

export interface I4DProject extends StandardAttribute {
  projectName: string;
  author: string;
  description: string;
  coverImage: string;
  season?: ISeason;
  phase?: IPhase;
  tags?: ITag[];
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
 *         id:
 *           type: string
 *         creationDateTime:
 *           type: string
 *         props:
 *           type: object
 *           properties:
 *             projectName:
 *               type: string
 *             author:
 *               type: string
 *             description:
 *               type: string
 *             coverImage:
 *               type: string
 *             season:
 *               $ref: "#/components/schemas/Season/properties/props"
 *             phase:
 *               $ref: "#/components/schemas/Phase/properties/props"
 *             tag:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/Tag/properties/props"
 */
export class Project extends Standard {

  readonly props: I4DProject;
  constructor(props: I4DProject) {
    super('Projects', props.id);
    this.props = props;
  }

  public getProps() {
    return this.props;
  }
}