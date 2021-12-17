import { APIGatewayProxyResult } from 'aws-lambda';
import { Phase } from '../../../models/Phase';
import { I4DProject, Project } from '../../../models/Project';
import { Season } from '../../../models/Season';
import { Tag } from '../../../models/Tag';
import DynamoDb from '../DynamoDb';

const dynamo = new DynamoDb({});
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
      const project = new Project(props);
      if (props.season) {
        await dynamo.addEntry(new Season({ seasonName: props.season.seasonName }));
      }
      if (props.phase) {
        await dynamo.addEntry(new Phase({ phaseName: props.phase.phaseName }));
      }
      if (props.tags) {
        props.tags.forEach(async (tag) => {
          await dynamo.addEntry(new Tag({ name: tag.name }));
        });
      }
      const entries = await dynamo.addEntry(project);
      statusCode = entries.$metadata.httpStatusCode ?? 400;
      if (statusCode === 200) {
        const result: APIGatewayProxyResult = {
          statusCode,
          body: `${project.getProps().projectName} has been successfully added`,
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
      statusCode,
      body: e.message,
    };
  }
};