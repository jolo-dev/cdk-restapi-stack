import {
  DynamoDBClient,
  CreateTableCommand,
  ScanCommand,
  PutItemCommand,
} from '@aws-sdk/client-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';
import { I4DProject, Project } from '../../models/Project';
import { Tag } from '../../models/Tag';
import DynamoDb from '../src/DynamoDb';

Date.now = jest.fn().mockReturnValue(new Date('2020-01-01T00:00:00.000'));

// id will be mocked unless you put your own id
jest.mock('uuid', () => {
  return {
    v4: jest.fn().mockReturnValue('123456789'),
  };
});

const ddbMock = mockClient(DynamoDBClient);

describe('DynamoDb', () => {
  const dynamo = new DynamoDb({ endpoint: 'http://localhost:4566', region: 'eu-west-1' });
  const props: I4DProject = {
    coverImage: 's3://url',
    description: 'This is a Description',
    name: 'TestProject',
    phase: 'Available',
    author: 'TestAuthor',
    season: 'Winter',
    creationDateTime: '2020-01-01T00:00:00+01:00',
  };

  const dynamoDbAttributes = {
    name: { S: 'TestProject' },
    coverImage: { S: 's3://url' },
    creationDateTime: { S: '2020-01-01T00:00:00+01:00' },
    description: { S: 'This is a Description' },
    phase: { S: 'Available' },
    author: { S: 'TestAuthor' },
    season: { S: 'Winter' },
  };
  const KeySchema = [
    { AttributeName: 'name', KeyType: 'HASH' },
    { AttributeName: 'creationDateTime', KeyType: 'RANGE' },
  ];
  const AttributeDefinitions = [
    { AttributeName: 'name', AttributeType: 'S' },
    { AttributeName: 'creationDateTime', AttributeType: 'S' },
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
      AttributeDefinitions,
      BillingMode: 'PAY_PER_REQUEST',
      GlobalSecondaryIndexes: [
        {
          IndexName: 'ProjectGSI',
          KeySchema: [
            { AttributeName: 'name', KeyType: 'HASH' },
            { AttributeName: 'creationDateTime', KeyType: 'RANGE' },
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
      AttributeDefinitions,
      TableName: 'Projects',
      KeySchema,
      BillingMode: 'Foo',
    })).rejects.toThrowError('Error when creating a table');
  });

  it('should create a Project object', () => {
    const project = dynamo.create<Project, I4DProject>(Project, props.name, props);
    expect(project).toEqual(new Project(props.name, props));
  });

  it('should scan the whole table', async () => {
    ddbMock.on(ScanCommand).resolves({
      Items: [dynamoDbAttributes],
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
    const project = dynamo.create<Project, I4DProject>(Project, props.name, props);

    const response = await dynamo.addEntry(project);
    expect(response.$metadata.httpStatusCode).toBe(200);
  });

  it('should add a list of tags to the dynamodb', () => {
    ddbMock.on(PutItemCommand).resolves({
      $metadata: {
        httpStatusCode: 200,
      },
    });
    const manyTags: I4DProject = {
      author: 'TestAuthor',
      coverImage: 's3://',
      description: 'test',
      name: 'ProjectName',
      tags: ['tags', 'name'],
    };
    if (manyTags.tags) {
      manyTags.tags?.forEach(async (tag) => {
        const response = await dynamo.addEntry(new Tag(tag));
        expect(response.$metadata.httpStatusCode).toBe(200);
      });
    }
  });

  it('should throw when adding new Project entry was not successful', async () => {
    ddbMock.on(PutItemCommand).rejects();
    const project = dynamo.create(Project, props.name, props);
    await expect(dynamo.addEntry(project))
      .rejects
      .toThrowError('Entry \'TestProject\' at 2020-01-01T00:00:00+01:00 could not be saved in Projects');
  });

  it('should map the dynamoDbAttributes coming from DynamoDB', () => {
    const projectProps = dynamo.attributesMapper<I4DProject>(dynamoDbAttributes);
    expect(projectProps).toEqual({
      coverImage: 's3://url',
      name: 'TestProject',
      description: 'This is a Description',
      phase: 'Available',
      author: 'TestAuthor',
      season: 'Winter',
      creationDateTime: '2020-01-01T00:00:00+01:00',
    });
  });

  it('should build the dynamoDbAttributes for DynamoDB', () => {
    const dynamoData = dynamo.dynamoDbDataBuilder<I4DProject>(props);
    expect(dynamoData).toEqual({
      coverImage: { S: 's3://url' },
      creationDateTime: { S: '2020-01-01T00:00:00+01:00' },
      description: { S: 'This is a Description' },
      name: { S: 'TestProject' },
      phase: { S: 'Available' },
      author: { S: 'TestAuthor' },
      season: { S: 'Winter' },
    });
  });

  it('should build the dynamoDbAttributes for DynamoDB when props contains Numbers and Boolean', () => {
    const dynamoData = dynamo.dynamoDbDataBuilder({
      name: '123456789',
      creationDateTime: '2020-01-01T00:00:00+00:00',
      testNumber: 2,
      testBoolean: true,
    });
    expect(dynamoData).toEqual({
      name: { S: '123456789' },
      creationDateTime: { S: '2020-01-01T00:00:00+00:00' },
      testNumber: { N: 2 },
      testBoolean: { B: true },
    });
  });

  it('should build the dynamoDbAttributes for DynamoDB after Entity is created', () => {
    const project = new Project(props.name, props);
    const dynamoData = dynamo.dynamoDbDataBuilder(
      { ...project.getProps(), ...{ creationDateTime: project.getCreationDateTime() } },
    );
    expect(dynamoData).toEqual(dynamoDbAttributes);
  });

  it('should return the correct type of an object', () => {
    const object = { season: { seasonName: 'Season' } };
    expect(dynamo.dynamoAttributeKeyValue(object, 'season')).toEqual({ season: { S: 'Season' } });
  });

  it('should return the correct type of a really nested object', () => {
    const object = {
      TopLevel:
        {
          Level:
          {
            Project:
            { season: { seasonNumber: 100 } },
          },
        },
    };
    expect(dynamo.dynamoAttributeKeyValue(object, 'TopLevel')).toEqual({ TopLevel: { N: 100 } });
  });

  it('should return undefined when object is undefined as well', () => {
    expect(() => dynamo.dynamoAttributeKeyValue(undefined, 'Foo'))
      .toThrowError('Error in dynamoAttributeKeyValue: object cannot be undefined');
  });
});