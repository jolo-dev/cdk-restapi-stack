import moment from 'moment';
import { v4 as uuid } from 'uuid';
import DynamoDb from '../src/DynamoDb';

describe('dynamoDb', () => {

  const dynamo = new DynamoDb({ endpoint: 'http://localhost:4566', region: 'eu-west-1' });
  it('should create the tables', async () => {
    const table = await dynamo.createTable({
      TableName: 'Projects',
      KeySchema: [
        { AttributeName: 'ID', KeyType: 'HASH' },
        { AttributeName: 'CreationDateTime', KeyType: 'RANGE' },
      ],
      AttributeDefinitions: [
        { AttributeName: 'ID', AttributeType: 'S' },
        { AttributeName: 'CreationDateTime', AttributeType: 'S' },
      ],
      BillingMode: 'PAY_PER_REQUEST',
      GlobalSecondaryIndexes: [
        {
          IndexName: 'ProjectGSI',
          KeySchema: [{ AttributeName: 'CreationDateTime', KeyType: 'RANGE' }],
          Projection: { ProjectionType: 'KEYS_ONLY' },
        },
      ],
    });

    expect(table.TableDescription).not.toBeUndefined();
  });

  it.only('should scan the whole table', async () => {
    const entries = await dynamo.listEntries({ TableName: 'Projects' });
    expect(entries.length).toBeGreaterThan(0);
  });

  it('should add a new entry to the table', async () => {
    const entry = await dynamo.addEntry({
      TableName: 'Projects',
      Item: {
        ID: {
          S: uuid(),
        },
        CreationDateTime: {
          S: moment().fromNow(),
        },
        ProjectName: {
          S: 'TestProject',
        },
        Author: {
          S: 'TestAuthor',
        },
        CoverImage: {
          S: 's3://url',
        },
        Season: {
          S: 'Winter',
        },
        State: {
          S: 'Available',
        },
      },
    });
    expect(entry).not.toBeUndefined();
  });
});