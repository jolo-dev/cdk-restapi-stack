import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import { I4DProject, Project } from '../../../models/Project';
import { config } from '../../config/config';
import DynamoDb from '../DynamoDb';

const dynamo = new DynamoDb(config);
/**
* @swagger
* /project:
*   put:
*    tags:
*      - Projects
*    requestBody:
*      $ref: "#/components/requestBodies/Project_data"
*    responses:
*      "200":
*         description: "Project has been updated successfully"
*      "400":
*         description: "Error in updating Entry ${entry} in Projects"
*/
export const handler = async (event: APIGatewayEvent) => {
  try {
    if (event.body) {
      let statusCode = 200;
      const props: I4DProject = JSON.parse(event.body);
      const entry = await dynamo.getItem<I4DProject>('Projects', props.name);
      const updatedProps = { ...entry, ...props };
      // Adding an entry with the same partition key works like updating them
      const updateEntry = new Project(entry.name, updatedProps, entry.creationDateTime);
      const entries = await dynamo.addEntry(updateEntry);
      statusCode = entries.$metadata.httpStatusCode ?? 400;
      if (statusCode === 200) {
        const result: APIGatewayProxyResult = {
          statusCode,
          body: `${updateEntry.getName()} has been successfully updated`,
        };
        return result;
      } else {
        throw new Error(`Error in updating Entry ${entry.name} in Projects`);
      }
    } else {
      throw new Error('The post body is empty or corrupt.');
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