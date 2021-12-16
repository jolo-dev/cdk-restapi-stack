import { DynamoDBClientConfig } from '@aws-sdk/client-dynamodb';
import { APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda';
import { ISeason, Season } from '../../../models/Season';
import DynamoDb from '../DynamoDb';
type SeasonsResult = APIGatewayProxyResult & {
  results: Season[];
}

const config: DynamoDBClientConfig = process.env.ENDPOINT ? { endpoint: process.env.ENDPOINT, region: 'eu-west-1' } : {};
const dynamo = new DynamoDb(config);
/**
 * @swagger
 * /seasons:
 *   get:
 *     tags:
 *       - Seasons
 *     responses:
 *       "400":
 *         description: "Error in getting Seasons"
 *         content:
 *           application/json:
 *             examples:
 *               seasons:
 *                 value: Error in getting Seasons
 *       "200":
 *         description: "A list of Seasons"
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/Season"
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