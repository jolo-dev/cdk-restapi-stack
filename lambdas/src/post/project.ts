import { APIGatewayProxyResult, APIGatewayProxyHandler, APIGatewayProxyEvent } from 'aws-lambda';
import { Project } from '../../../models/Project';
import DynamoDb from '../DynamoDb';

const dynamo = new DynamoDb({});
/**
 * @openapi
 * /project:
 *   post:
 *    projects:
 *      - Projects
 *    requestBody:
 *      $ref: "#/components/requestBodies/project_data"
 *    responses:
 *      "400":
 *         description: "Error in adding a new project"
 *      "200":
 *         description: "Project has been added successfully"
 */
export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent) => {
  let statusCode = 200;
  try {
    if (event.body) {
      const props = JSON.parse(event.body);
      const project = new Project(props);
      const entries = await dynamo.addEntry(project);
      statusCode = entries.$metadata.httpStatusCode ?? 400;
      if (statusCode === 200) {
        const result: APIGatewayProxyResult = {
          statusCode,
          body: `${project.getProps().ProjectName} has been successfully added`,
        };
        return result;
      } else {
        throw new Error(`Error in adding Entry to Projects ${event.body}`);
      }
    } else {
      throw new Error(`The post body is empty or corrupt ${event.body}`);
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