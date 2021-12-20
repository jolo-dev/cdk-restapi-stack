import { APIGatewayProxyResult } from 'aws-lambda';
import { StandardAttribute } from '../../../models/StandardAttribute';
import { Tag } from '../../../models/Tag';
import { config } from '../../config/config';
import DynamoDb from '../DynamoDb';

const dynamo = new DynamoDb(config);
/**
 * @swagger
 * /tag:
 *   post:
 *     tags:
 *       - Tags
 *     requestBody:
 *       $ref: "#/components/requestBodies/Tag_data"
 *     responses:
 *       "400":
 *         description: "Error in adding a new Tag"
 *       "200":
 *         description: "Tag has been added successfully"
 */
export const handler = async (props: StandardAttribute) => {
  let statusCode = 200;
  try {
    if (props) {
      const tag = new Tag(props.name);
      const entries = await dynamo.addEntry(tag);
      statusCode = entries.$metadata.httpStatusCode ?? 400;
      if (statusCode === 200) {
        const result: APIGatewayProxyResult = {
          statusCode,
          body: `Tag with Name: ${tag.getName()} has been successfully added`,
        };
        return result;
      } else {
        throw new Error(`Error in adding Entry to Tags ${props}`);
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