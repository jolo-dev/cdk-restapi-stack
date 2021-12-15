import { APIGatewayProxyResult } from 'aws-lambda';
import { ITag, Tag } from '../../../models/Tag';
import DynamoDb from '../DynamoDb';

const dynamo = new DynamoDb({});
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
export const handler = async (props: ITag) => {
  let statusCode = 200;
  try {
    if (props) {
      const project = new Tag(props);
      const entries = await dynamo.addEntry(project);
      statusCode = entries.$metadata.httpStatusCode ?? 400;
      if (statusCode === 200) {
        const result: APIGatewayProxyResult = {
          statusCode,
          body: `Tag with Name: ${project.getProps().name} has been successfully added`,
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
      statusCode,
      body: e.message,
    };
  }

};