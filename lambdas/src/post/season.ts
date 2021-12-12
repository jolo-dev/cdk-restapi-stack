import { APIGatewayProxyResult, APIGatewayProxyHandler, APIGatewayProxyEvent } from 'aws-lambda';
import { Season } from '../../../models/Season';
import DynamoDb from '../DynamoDb';

const dynamo = new DynamoDb({});
/**
 * @swagger
 * /season:
 *   post:
 *     tags:
 *       - Seasons
 *     requestBody:
 *       $ref: "#/components/requestBodies/Season_data"
 *     responses:
 *       "400":
 *         description: "Error in adding a new season"
 *       "200":
 *         description: "Season has been added successfully"
 */
export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent) => {
  let statusCode = 200;
  try {
    if (event.body) {
      const props = JSON.parse(event.body);
      const entry = new Season(props);
      const entries = await dynamo.addEntry(entry);
      statusCode = entries.$metadata.httpStatusCode ?? 400;
      if (statusCode === 200) {
        const result: APIGatewayProxyResult = {
          statusCode,
          body: `${entry.getProps().SeasonName} has been successfully added`,
        };
        return result;
      } else {
        throw new Error(`Error in adding Entry to Seasons ${event.body}`);
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