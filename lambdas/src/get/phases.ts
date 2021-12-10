import { APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda';
import { IPhase, Phase } from '../../../models/Phase';
import DynamoDb from '../DynamoDb';
type PhasesResult = APIGatewayProxyResult & {
  results: Phase[];
}
const dynamo = new DynamoDb({});
/**
 * @openapi
 * /phases:
 *   get:
 *     phases:
 *       - Phases
 *     responses:
 *       "400":
 *         description: "Error in getting phases"
 *         content:
 *           application/json:
 *             examples:
 *               phases:
 *                 value: Error in Getting Phases
 *       "200":
 *         description: "A list of phases"
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/phase_data'
 */
export const handler: APIGatewayProxyHandler = async () => {
  try {
    const entries = await dynamo.listEntries<Phase, IPhase>('Phases', Phase);
    if (entries.length > 0) {
      const result: PhasesResult = {
        statusCode: 200,
        body: JSON.stringify(entries),
        results: entries,
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