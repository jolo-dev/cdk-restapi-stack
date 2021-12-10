import { APIGatewayProxyResult, APIGatewayProxyHandler, APIGatewayProxyEvent } from 'aws-lambda';
import { Phase } from '../../../models/Phase';
import DynamoDb from '../DynamoDb';

const dynamo = new DynamoDb({});
/**
 * @openapi
 * /phase:
 *   post:
 *    phases:
 *      - Phases
 *    requestBody:
 *      $ref: "#/components/requestBodies/phase_data"
 *    responses:
 *      "400":
 *         description: "Error in adding a new phase"
 *      "200":
 *         description: "Phase has been added successfully"
 */
export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent) => {
  let statusCode = 200;
  try {
    if (event.body) {
      const props = JSON.parse(event.body);
      const entry = new Phase(props);
      const entries = await dynamo.addEntry(entry);
      statusCode = entries.$metadata.httpStatusCode ?? 400;
      if (statusCode === 200) {
        const result: APIGatewayProxyResult = {
          statusCode,
          body: `${entry.getProps().PhaseName} has been successfully added`,
        };
        return result;
      } else {
        throw new Error(`Error in adding Entry to Phases ${event.body}`);
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