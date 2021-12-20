import { APIGatewayProxyResult } from 'aws-lambda';
import { Phase } from '../../../models/Phase';
import { I4DProject, Project } from '../../../models/Project';
import { Season } from '../../../models/Season';
import { Tag } from '../../../models/Tag';
import { config } from '../../config/config';
import DynamoDb from '../DynamoDb';

const dynamo = new DynamoDb(config);
/**
 * @swagger
 * /project:
 *   post:
 *     tags:
 *       - Projects
 *     requestBody:
 *       $ref: "#/components/requestBodies/Project_data"
 *     responses:
 *       "400":
 *         description: "Error in adding a new project"
 *       "200":
 *         description: "Project has been added successfully"
 */
export const handler = async (props: I4DProject) => {
  let statusCode = 200;
  try {
    if (props) {

      const project = new Project(props.name, props);
      if (props.season) {
        await dynamo.addEntry(new Season(props.season));
      }
      if (props.phase) {
        await dynamo.addEntry(new Phase(props.phase));
      }
      if (props.tags) {
        for (const tag of props.tags) {
          await dynamo.addEntry(new Tag(tag));
        }
      }
      const entries = await dynamo.addEntry(project);
      statusCode = entries.$metadata.httpStatusCode ?? 400;
      if (statusCode === 200) {
        const result: APIGatewayProxyResult = {
          statusCode,
          body: `${project.getName()} has been successfully added`,
        };
        return result;
      } else {
        throw new Error(`Error in adding Entry to Projects ${props}`);
      }
    } else {
      throw new Error(`The post body is empty or corrupt ${props}`);
    }
  } catch (error) {
    console.error(error);
    const e = error as Error;
    return {
      statusCode: 400,
      body: e.message,
    };
  }
};