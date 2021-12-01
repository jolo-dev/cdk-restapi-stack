import { Context, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';


export const handler = (event: APIGatewayProxyEvent, context: Context) => {
  const result: APIGatewayProxyResult = {
    statusCode: 200,
    body: 'Hello 👋🏻 from Lambda ',
  };
  return result;
};