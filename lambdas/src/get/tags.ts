import { DynamoDBClientConfig } from '@aws-sdk/client-dynamodb';
import { APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda';
import { ITag, Tag } from '../../../models/Tag';
import DynamoDb from '../DynamoDb';

type TagsResult = APIGatewayProxyResult & {
  results: Tag[];
}

const config: DynamoDBClientConfig = process.env.ENDPOINT ? { endpoint: process.env.ENDPOINT, region: 'eu-west-1' } : {};
const dynamo = new DynamoDb(config);
/**
 * @swagger
 * /tags:
 *   get:
 *     tags:
 *       - Tags
 *     responses:
 *       "400":
 *         description: "Error in getting Tags"
 *       "200":
 *         description: "A list of Tags"
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/Tag"
 */
export const handler: APIGatewayProxyHandler = async () => {
  try {
    const entries = await dynamo.listEntries<Tag, ITag>('Tags', Tag);
    if (entries.length > 0) {
      const result: TagsResult = {
        statusCode: 201,
        body: JSON.stringify(entries),
        results: entries,
      };
      return result;
    } else {
      return {
        statusCode: 200,
        body: 'No Tag-Entries',
      };
    }
  } catch (error) {
    console.error(error);
    const e = error as Error;
    return {
      statusCode: 400,
      body: `Error in Getting Tags: ${e.message}`,
    };
  }
};