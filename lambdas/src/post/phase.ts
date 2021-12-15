import { APIGatewayProxyResult } from 'aws-lambda';
import { Phase, IPhase } from '../../../models/Phase';
import DynamoDb from '../DynamoDb';

const dynamo = new DynamoDb({});
/**
 * @swagger
 * /phase:
 *   post:
 *     tags:
 *       - Phases
 *     requestBody:
 *       $ref: "#/components/requestBodies/Phase_data"
 *     responses:
 *       "400":
 *         description: "Error in adding a new phase"
 *       "200":
 *         description: "Phase has been added successfully"
 */
export const handler = async (props: IPhase) => {
  let statusCode = 200;
  try {
    if (props) {
      const entry = new Phase(props);
      const entries = await dynamo.addEntry(entry);
      statusCode = entries.$metadata.httpStatusCode ?? 400;
      if (statusCode === 200) {
        const result: APIGatewayProxyResult = {
          statusCode,
          body: `${entry.getProps().phaseName} has been successfully added`,
        };
        return result;
      } else {
        throw new Error(`Error in adding Entry to Phases ${props}`);
      }
    } else {
      throw new Error(`The post body is empty or corrupt ${props}`);
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