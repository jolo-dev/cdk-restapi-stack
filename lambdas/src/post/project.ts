import { APIGatewayProxyResult, APIGatewayProxyHandler, APIGatewayProxyEvent } from 'aws-lambda';
import { Project } from '../../../models/Project';
import DynamoDb from '../DynamoDb';

const dynamo = new DynamoDb({});
export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent) => {
  try {
    if (event.body) {
      const props = JSON.parse(event.body);
      const project = new Project(props);
      const entries = await dynamo.addEntry(project);
      if (entries.$metadata.httpStatusCode === 200) {
        const result: APIGatewayProxyResult = {
          statusCode: 200,
          body: JSON.stringify(entries),
        };
        return result;
      } else {
        throw new Error(`Error in adding Entry to Projects ${event.body}`);
      }
    } else {
      throw new Error(`The post body is empty or corrupt ${event.body}`);
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