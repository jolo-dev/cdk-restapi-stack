import { APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda';
import { Phase } from '../../../models/Phase';
import { StandardAttribute } from '../../../models/StandardAttribute';
import { config } from '../../config/config';
import DynamoDb from '../DynamoDb';

const dynamo = new DynamoDb(config);
/**
 * @swagger
 * /phases:
 *   get:
 *     tags:
 *       - Phases
 *     responses:
 *       "400":
 *         description: "Error in getting Phases"
 *         content:
 *           application/json:
 *             examples:
 *               phases:
 *                 value: Error in Getting Phases
 *       "200":
 *         description: "A list of Phases"
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/Phase"
 */
export const handler: APIGatewayProxyHandler = async () => {
  try {
    const entries = await dynamo.listEntries<Phase, StandardAttribute>('Phases', Phase);
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
        body: 'No Phase-Entries',
      };
    }
  } catch (error) {
    console.error(error);
    const e = error as Error;
    return {
      statusCode: 400,
      body: `Error in Getting Phases: ${e.message}`,
    };
  }
};