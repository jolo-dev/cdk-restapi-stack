import { APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda';
import DynamoDb from '../DynamoDb';

const dynamo = new DynamoDb({});
export const handler: APIGatewayProxyHandler = async () => {
  try {
    const entries = await dynamo.listEntries('Projects');
    if (entries.length > 0) {
      const result: APIGatewayProxyResult = {
        statusCode: 200,
        body: JSON.stringify(entries),
      };
      return result;
    } else {
      return {
        statusCode: 200,
        body: 'No Project-Entries',
      };
    }
  } catch (error) {
    console.error(error);
    const e = error as Error;
    return {
      statusCode: 400,
      body: `Error in Getting Projects: ${e.message}`,
    };
  }

};