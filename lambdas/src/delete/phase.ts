import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import { StandardAttribute } from '../../../models/StandardAttribute';
import { config } from '../../config/config';
import DynamoDb from '../DynamoDb';

const dynamo = new DynamoDb(config);
/**
* @swagger
* /phase:
*   delete:
*    tags:
*      - Phases
*    requestBody:
*       description: Request to delete a Phase by its name.
*       required: true
*       content:
*         application/json:
*           schema:
*             type: object
*             properties:
*               name:
*                 type: string
*    responses:
*      "200":
*         description: "Phase has been deleted successfully"
*      "400":
*         description: "Error in deleting Phase"
*/
export const handler = async (event: APIGatewayEvent) => {
  let statusCode = 200;
  try {
    if (event.body) {
      const entry: StandardAttribute = JSON.parse(event.body);
      const entries = await dynamo.deleteEntry('Phases', entry.name);
      statusCode = entries.$metadata.httpStatusCode ?? 400;
      if (statusCode === 200) {
        const result: APIGatewayProxyResult = {
          statusCode,
          body: `${entry.name} has been successfully deleted`,
        };
        return result;
      } else {
        throw new Error(`Error in deleting ${entry.name} in Phases`);
      }
    } else {
      throw new Error(`The post body is empty or corrupt ${event.body}`);
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