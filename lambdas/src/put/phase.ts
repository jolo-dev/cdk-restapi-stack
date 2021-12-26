import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import { Phase } from '../../../models/Phase';
import { StandardAttribute } from '../../../models/StandardAttribute';
import { config } from '../../config/config';
import DynamoDb from '../DynamoDb';

const dynamo = new DynamoDb(config);
/**
* @swagger
* /phase:
*   put:
*    tags:
*      - Phases
*    requestBody:
*      ref: "#/components/requestBodies/Phase_data"
*    responses:
*      "200":
*         description: "Phase has been updated successfully"
*      "400":
*         description: "Error in updating Entry entry in Phases"
*/
export const handler = async (event: APIGatewayEvent) => {
  try {
    if (event.body) {
      let statusCode = 200;
      const props: StandardAttribute = JSON.parse(event.body);
      const entry = await dynamo.getItem<StandardAttribute>('Phases', props.name);
      const updatedProps = { ...entry, ...props };
      // Adding an entry with the same partition key works like updating them
      const updateEntry = new Phase(entry.name, updatedProps, entry.creationDateTime);
      const entries = await dynamo.addEntry(updateEntry);
      statusCode = entries.$metadata.httpStatusCode ?? 400;
      if (statusCode === 200) {
        const result: APIGatewayProxyResult = {
          statusCode,
          body: `${updateEntry.getName()} has been successfully added`,
        };
        return result;
      } else {
        throw new Error(`Error in updating Entry ${entry.name} in Phases`);
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