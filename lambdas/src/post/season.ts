import { APIGatewayProxyResult, APIGatewayEvent } from 'aws-lambda';
import { Season } from '../../../models/Season';
import { StandardAttribute } from '../../../models/StandardAttribute';
import { config } from '../../config/config';
import DynamoDb from '../DynamoDb';

const dynamo = new DynamoDb(config);
/**
 * @swagger
 * /season:
 *   post:
 *     tags:
 *       - Seasons
 *     requestBody:
 *       $ref: "#/components/requestBodies/Season_data"
 *     responses:
 *       "201":
 *         description: "Season has been added successfully"
 *       "400":
 *         description: "Error in adding a new season"
 *       "406":
 *         description: "The post body is empty or corrupt."
 */
export const handler = async (event: APIGatewayEvent) => {
  try {
    if (event.body) {
      let statusCode = 200;
      const props: StandardAttribute = JSON.parse(event.body);
      const entry = new Season(props.name);
      const entries = await dynamo.addEntry(entry);
      statusCode = entries.$metadata.httpStatusCode ?? 400;
      if (statusCode === 200) {
        const result: APIGatewayProxyResult = {
          statusCode: 201,
          body: `${entry.getName()} has been successfully added`,
        };
        return result;
      } else {
        throw new Error(`Error in adding Entry to Seasons ${props}`);
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