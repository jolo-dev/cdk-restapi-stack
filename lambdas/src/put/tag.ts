import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import { StandardAttribute } from '../../../models/StandardAttribute';
import { Tag } from '../../../models/Tag';
import { config } from '../../config/config';
import DynamoDb from '../DynamoDb';

const dynamo = new DynamoDb(config);
/**
* @swagger
* /tag:
*   put:
*    tags:
*      - Tags
*    requestBody:
*      ref: "#/components/requestBodies/Tag_data"
*    responses:
*      "200":
*         description: "Tag has been updated successfully"
*      "400":
*         description: "Error in updating Entry entry in Tags"
*/
export const handler = async (event: APIGatewayEvent) => {
  try {
    if (event.body) {
      let statusCode = 200;
      const props: StandardAttribute = JSON.parse(event.body);
      const entry = await dynamo.getItem<StandardAttribute>('Tags', props.name);
      const updatedProps = { ...entry, ...props };
      // Adding an entry with the same partition key works like updating them
      const updateEntry = new Tag(entry.name, updatedProps, entry.creationDateTime);
      const entries = await dynamo.addEntry(updateEntry);
      statusCode = entries.$metadata.httpStatusCode ?? 400;
      if (statusCode === 200) {
        const result: APIGatewayProxyResult = {
          statusCode,
          body: `${updateEntry.getName()} has been successfully added`,
        };
        return result;
      } else {
        throw new Error(`Error in updating Entry ${entry.name} in Tags`);
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