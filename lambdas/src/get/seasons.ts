import { APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda';
import { ISeason, Season } from '../../../models/Season';
import DynamoDb from '../DynamoDb';
type SeasonsResult = APIGatewayProxyResult & {
  results: Season[];
}
const dynamo = new DynamoDb({});
/**
 * @openapi
 * /seasons:
 *   get:
 *     tags:
 *       - Seasons
 *     responses:
 *       "400":
 *         description: "Error in getting Seasons"
 *       "200":
 *         description: "A list of Seasons"
 */
export const handler: APIGatewayProxyHandler = async () => {
  try {
    const entries = await dynamo.listEntries<Season, ISeason>('Seasons', Season);
    if (entries.length > 0) {
      const result: SeasonsResult = {
        statusCode: 200,
        body: JSON.stringify(entries),
        results: entries,
      };
      return result;
    } else {
      return {
        statusCode: 200,
        body: 'No Season-Entries',
      };
    }
  } catch (error) {
    console.error(error);
    const e = error as Error;
    return {
      statusCode: 400,
      body: `Error in Getting Seasons: ${e.message}`,
    };
  }
};