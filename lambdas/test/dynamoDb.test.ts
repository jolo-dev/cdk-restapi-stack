import {
  DynamoDBClient,
  CreateTableCommand,
  ScanCommand,
  PutItemCommand,
} from '@aws-sdk/client-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';
import { IPhase } from '../../models/Phase';
import { I4DProject, Project } from '../../models/Project';
import { ISeason } from '../../models/Season';
import DynamoDb from '../src/DynamoDb';

Date.now = jest.fn().mockReturnValue(new Date('2020-01-01T00:00:00.000'));

// ID will be mocked unless you put your own ID
jest.mock('uuid', () => {
  return {
    v4: jest.fn().mockReturnValue('123456789'),
  };
});

const ddbMock = mockClient(DynamoDBClient);

describe('DynamoDb', () => {
  const dynamo = new DynamoDb({ endpoint: 'http://localhost:4566', region: 'eu-west-1' });
  const Phase: IPhase = {
    PhaseName: 'Available',
  };
  const Season: ISeason = {
    SeasonName: 'Winter',
  };
  const props: I4DProject = {
    CoverImage: 's3://url',
    Description: 'This is a Description',
    ProjectName: 'TestProject',
    Phase,
    Author: 'TestAuthor',
    Season,
  };

  const attributes = {
    CoverImage: { S: 's3://url' },
    CreationDateTime: { S: '2020-01-01T00:00:00+01:00' },
    Description: { S: 'This is a Description' },
    ProjectName: { S: 'TestProject' },
    Phase: { S: 'Available' },
    Author: { S: 'TestAuthor' },
    ID: { S: '123456789' },
    Season: { S: 'Winter' },
  };
  const KeySchema = [
    { AttributeName: 'ID', KeyType: 'HASH' },
    { AttributeName: 'CreationDateTime', KeyType: 'RANGE' },
  ];
  it('should create the tables', async () => {

    ddbMock.on(CreateTableCommand).resolves({
      TableDescription: {
        KeySchema,
      },
      $metadata: {
        httpStatusCode: 200,
      },
    });
    const table = await dynamo.createTable({
      TableName: 'Projects',
      KeySchema,
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

    expect(table.$metadata.httpStatusCode).toBe(200);
    expect(table.TableDescription).not.toBeUndefined();
    expect(table.TableDescription?.KeySchema).toEqual(KeySchema);
  });

  it('should throw when creating table was not successful', async () => {
    ddbMock.on(CreateTableCommand).rejects();
    await expect(dynamo.createTable({
      AttributeDefinitions: [
        { AttributeName: 'ID', AttributeType: 'S' },
        { AttributeName: 'CreationDateTime', AttributeType: 'S' },
      ],
      TableName: 'Projects',
      KeySchema,
      BillingMode: 'Foo',
    })).rejects.toThrowError('Error when creating a table');
  });

  it('should create a Project object', () => {
    const project = dynamo.create(Project, props);
    expect(project).toEqual(new Project(props));
  });

  it('should scan the whole table', async () => {
    ddbMock.on(ScanCommand).resolves({
      Items: [attributes],
    });
    const entries = await dynamo.listEntries<Project, I4DProject>('Projects', Project);
    expect(entries.length).toBeGreaterThan(0);
  });

  it('should throw when no items in table', async () => {
    ddbMock.on(ScanCommand).resolves({
      Count: 0,
    });
    await expect(dynamo.listEntries<Project, I4DProject>('Projects', Project))
      .rejects.toThrowError('No Items in the table: Projects');
  });

  it('should add a new Project entry to Projects table', async () => {
    ddbMock.on(PutItemCommand).resolves({
      $metadata: {
        httpStatusCode: 200,
      },
    });
    const project = dynamo.create(Project, props);
    const response = await dynamo.addEntry(project);
    expect(response.$metadata.httpStatusCode).toBe(200);
  });

  it('should throw when adding new Project entry was not successful', async () => {
    ddbMock.on(PutItemCommand).rejects();
    const project = dynamo.create(Project, props);
    await expect(dynamo.addEntry(project))
      .rejects
      .toThrowError('Entry with ID 123456789 at 2020-01-01T00:00:00+01:00 could not be saved in Projects');
  });

  it('should map the attributes coming from DynamoDB', () => {
    const projectProps = dynamo.attributesMapper<I4DProject>(attributes);
    expect(projectProps).toEqual({
      CoverImage: 's3://url',
      ProjectName: 'TestProject',
      Description: 'This is a Description',
      Phase: 'Available',
      Author: 'TestAuthor',
      Season: 'Winter',
    });
  });

  it('should build the attributes for DynamoDB', () => {
    const dynamoData = dynamo.dynamoDbDataBuilder<I4DProject>(props);
    expect(dynamoData).toEqual({
      CoverImage: { S: 's3://url' },
      CreationDateTime: { S: '2020-01-01T00:00:00+01:00' },
      Description: { S: 'This is a Description' },
      ProjectName: { S: 'TestProject' },
      Phase: { S: 'Available' },
      Author: { S: 'TestAuthor' },
      ID: { S: '123456789' },
      Season: { S: 'Winter' },
    });
  });

  it('should build the attributes for DynamoDB when props contains Numbers and Boolean', () => {
    const dynamoData = dynamo.dynamoDbDataBuilder({
      ID: '123456789',
      CreationDateTime: '2020-01-01T00:00:00+00:00',
      TestNumber: 2,
      TestBoolean: true,
    });
    expect(dynamoData).toEqual({
      ID: { S: '123456789' },
      CreationDateTime: { S: '2020-01-01T00:00:00+00:00' },
      TestNumber: { N: 2 },
      TestBoolean: { B: true },
    });
  });

  it('should build the attributes for DynamoDB after Entity is created', () => {
    const project = new Project(props);
    const dynamoData = dynamo.dynamoDbDataBuilder(project.getProps());
    expect(dynamoData).toEqual(attributes);
  });

  it('should return the correct type of an object', () => {
    const object = { Season: { SeasonName: 'Season' } };
    expect(dynamo.dynamoAttributeKeyValue(object, 'Season')).toEqual({ Season: { S: 'Season' } });
  });

  it('should return the correct type of a really nested object', () => {
    const object = {
      TopLevel:
        {
          Level:
          {
            Project:
            { Season: { SeasonNumber: 100 } },
          },
        },
    };
    expect(dynamo.dynamoAttributeKeyValue(object, 'TopLevel')).toEqual({ TopLevel: { N: 100 } });
  });
});