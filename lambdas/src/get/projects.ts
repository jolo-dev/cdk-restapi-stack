import { APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda';
import { I4DProject, Project } from '../../../models/Project';
import DynamoDb from '../DynamoDb';

type ProjectsResult = APIGatewayProxyResult & {
  results: Project[];
}

const dynamo = new DynamoDb({});
export const handler: APIGatewayProxyHandler = async () => {
  try {
    const entries = await dynamo.listEntries<Project, I4DProject>('Projects', Project);
    if (entries.length > 0) {
      const result: ProjectsResult = {
        statusCode: 200,
        body: 'success',
        results: entries,
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