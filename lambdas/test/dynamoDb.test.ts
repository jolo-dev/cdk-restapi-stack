import moment from 'moment';
import { v4 as uuid } from 'uuid';
// import { FourDProject, I4DProject } from '../../models/Project';
import DynamoDb from '../src/DynamoDb';

describe('DynamoDb', () => {

  const dynamo = new DynamoDb({ endpoint: 'http://localhost:4566', region: 'eu-west-1' });
  it.skip('should create the tables', async () => {
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
          KeySchema: [
            { AttributeName: 'ID', KeyType: 'HASH' },
            { AttributeName: 'CreationDateTime', KeyType: 'RANGE' },
          ],
          Projection: { ProjectionType: 'KEYS_ONLY' },
        },
      ],
    });

    expect(table.TableDescription).not.toBeUndefined();
  });

  it.only('should scan the whole table', async () => {
    const entries = await dynamo.listEntries('Projects');
    expect(entries.length).toBeGreaterThan(0);
  });

  it('should map the attributes coming from DynamoDB', () => {
    const attributes = {
      CoverImage: { S: 's3://url' },
      CreationDateTime: { S: 'a few seconds ago' },
      ProjectName: { S: 'TestProject' },
      State: { S: 'Available' },
      Author: { S: 'TestAuthor' },
      ID: { S: '381181da-0f2c-430f-a47e-c07f5284c245' },
      Season: { S: 'Winter' },
    };
    const props = dynamo.attributesMapper(attributes);
    expect(props).toEqual({
      CoverImage: 's3://url',
      CreationDateTime: 'a few seconds ago',
      ProjectName: 'TestProject',
      State: 'Available',
      Author: 'TestAuthor',
      ID: '381181da-0f2c-430f-a47e-c07f5284c245',
      Season: 'Winter',
    });
  });

  it.skip('should add a new entry to the table', async () => {
    const entry = await dynamo.addEntry({
      TableName: 'Projects',
      Item: {
        ID: {
          S: uuid(),
        },
        CreationDateTime: {
          S: moment().format(),
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