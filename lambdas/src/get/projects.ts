import { APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda';
import DynamoDb from '../DynamoDb';

const dynamo = new DynamoDb({});
export const handler: APIGatewayProxyHandler = async () => {
  const entries = await dynamo.listEntries('Projects');
  try {
    if (entries) {
      const result: APIGatewayProxyResult = {
        statusCode: 200,
        body: JSON.stringify(entries),
      };
      return result;
    } else {
      throw new Error();
    }
  } catch (error) {
    console.error(error);
    const e = error as Error;
    throw new Error(`Error in Getting Projects ${e.message}`);
  }

};