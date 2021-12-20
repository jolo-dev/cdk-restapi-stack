import { APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda';
import { I4DProject, Project } from '../../../models/Project';
import { config } from '../../config/config';
import DynamoDb from '../DynamoDb';

type ProjectsResult = APIGatewayProxyResult & {
  results: Project[];
}

const dynamo = new DynamoDb(config);
/**
 * @swagger
 * /projects:
 *   get:
 *     tags:
 *       - Projects
 *     responses:
 *       "400":
 *         description: "Error in getting projects"
 *         content:
 *           application/json:
 *             examples:
 *               projects:
 *                 value: Error in getting projects
 *       "200":
 *         description: "A list of projects"
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/Project"
 */
export const handler: APIGatewayProxyHandler = async () => {
  try {
    const entries = await dynamo.listEntries<Project, I4DProject>('Projects', Project);
    const results = entries.map(value => {
      delete value.props.creationDateTime;
      return value;
    });
    if (entries.length > 0) {
      const result: ProjectsResult = {
        statusCode: 200,
        body: JSON.stringify(entries),
        results,
      };
      return result;
    } else {
      return {
        statusCode: 200,
        body: 'No Project-Entries',
      };
    }
  } catch (error) {
    console.error(error);
    const e = error as Error;
    return {
      statusCode: 400,
      body: `Error in getting projects: ${e.message}, endpoint: ${process.env.LOCALSTACK_HOSTNAME}}, region: ${config.region}`,
    };
  }

};