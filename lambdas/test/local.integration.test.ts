import { Project } from '../../models/Project';
import DynamoDb from '../src/DynamoDb';

Date.now = jest.fn().mockReturnValue(new Date('2020-01-01T00:00:00.000'));

// ID will be mocked unless you put your own ID
jest.mock('uuid', () => {
  return {
    v4: jest.fn().mockReturnValue('123456789'),
  };
});

describe('POST', () => {
  const dynamo = new DynamoDb({ endpoint: 'http://localhost:4566', region: 'eu-west-1' });
  test('add Project', async () => {
    const body = JSON.stringify({ CoverImage: 's3://url', Description: 'This is a Description', ProjectName: 'TestProject', Phase: 'Available', Author: 'TestAuthor', Season: 'Winter' });
    const props = JSON.parse(body);
    const project = new Project(props);
    const entries = await dynamo.addEntry(project);
    expect(entries.$metadata.httpStatusCode).toBe(200);

    const result = await dynamo.listEntries('Projects');
    expect(result[0]).toEqual(project);
  });
});