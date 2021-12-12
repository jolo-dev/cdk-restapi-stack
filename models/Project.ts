import { IPhase } from './Phase';
import { ISeason } from './Season';
import { StandardAttribute, Standard } from './StandardAttribute';
import { ITag } from './Tag';

export interface I4DProject extends StandardAttribute {
  ProjectName: string;
  Author: string;
  Description: string;
  CoverImage: string;
  Season?: ISeason;
  Phase?: IPhase;
  Tags?: ITag[];
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
 *             $ref: "#/components/schemas/Project"
 *   schemas:
 *     Project:
 *       type: object
 *       properties:
 *         ID:
 *           type: string
 *         CreationDateTime:
 *           type: string
 *         props:
 *           type: object
 *           properties:
 *             ProjectName:
 *               type: string
 *             Author:
 *               type: string
 *             Description:
 *               type: string
 *             CoverImage:
 *               type: string
 *             Season:
 *               $ref: "#/components/schemas/Season"
 *             Phase:
 *               $ref: "#/components/schemas/Phase"
 *             Tag:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/Tag"
 */
export class Project extends Standard {

  readonly props: I4DProject;
  constructor(props: I4DProject) {
    super('Projects', props.ID, props.CreationDateTime);
    this.props = props;
  }

  public getProps() {
    return this.props;
  }
}