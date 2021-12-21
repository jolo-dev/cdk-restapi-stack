import { APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda';
import { StandardAttribute } from '../../../models/StandardAttribute';
import { Tag } from '../../../models/Tag';
import { config } from '../../config/config';
import DynamoDb from '../DynamoDb';

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
    const entries = await dynamo.listEntries<Tag, StandardAttribute>('Tags', Tag);
    if (entries.length > 0) {
      const result: APIGatewayProxyResult = {
        headers: {
          'Content-Type': 'application/json',
        },
        statusCode: 200,
        body: JSON.stringify(entries),
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