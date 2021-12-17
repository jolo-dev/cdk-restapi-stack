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
  const phase: IPhase = {
    phaseName: 'Available',
  };
  const season: ISeason = {
    seasonName: 'Winter',
  };
  const props: I4DProject = {
    coverImage: 's3://url',
    description: 'This is a Description',
    projectName: 'TestProject',
    phase,
    author: 'TestAuthor',
    season,
  };

  const attributes = {
    coverImage: { S: 's3://url' },
    creationDateTime: { S: '2020-01-01T00:00:00+01:00' },
    description: { S: 'This is a Description' },
    projectName: { S: 'TestProject' },
    phase: { S: 'Available' },
    author: { S: 'TestAuthor' },
    id: { S: '123456789' },
    season: { S: 'Winter' },
  };
  const KeySchema = [
    { AttributeName: 'id', KeyType: 'HASH' },
    { AttributeName: 'creationDateTime', KeyType: 'RANGE' },
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
        { AttributeName: 'id', AttributeType: 'S' },
        { AttributeName: 'creationDateTime', AttributeType: 'S' },
      ],
      BillingMode: 'PAY_PER_REQUEST',
      GlobalSecondaryIndexes: [
        {
          IndexName: 'ProjectGSI',
          KeySchema: [
            { AttributeName: 'id', KeyType: 'HASH' },
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
      AttributeDefinitions: [
        { AttributeName: 'id', AttributeType: 'S' },
        { AttributeName: 'creationDateTime', AttributeType: 'S' },
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

  it.only('should add a list of tags to the dynamodb', () => {
    ddbMock.on(PutItemCommand).resolves({
      $metadata: {
        httpStatusCode: 200,
      },
    });
    const manyTags: I4DProject = {
      author: 'TestAuthor',
      coverImage: 's3://',
      description: 'test',
      projectName: 'ProjectName',
      tags: [{ name: 'tags' }, { name: 'name' }],
    };
    if (manyTags.tags) {
      manyTags.tags?.forEach(async (tag) => {
        const response = await dynamo.addEntry(new Tag({ name: tag.name }));
        expect(response.$metadata.httpStatusCode).toBe(200);
      });
    }
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
      coverImage: 's3://url',
      projectName: 'TestProject',
      description: 'This is a Description',
      phase: 'Available',
      author: 'TestAuthor',
      season: 'Winter',
      creationDateTime: '2020-01-01T00:00:00+01:00',
      id: '123456789',
    });
  });

  it('should build the attributes for DynamoDB', () => {
    const dynamoData = dynamo.dynamoDbDataBuilder<I4DProject>(props);
    expect(dynamoData).toEqual({
      coverImage: { S: 's3://url' },
      creationDateTime: { S: '2020-01-01T00:00:00+01:00' },
      description: { S: 'This is a Description' },
      projectName: { S: 'TestProject' },
      phase: { S: 'Available' },
      author: { S: 'TestAuthor' },
      id: { S: '123456789' },
      season: { S: 'Winter' },
    });
  });

  it('should build the attributes for DynamoDB when props contains Numbers and Boolean', () => {
    const dynamoData = dynamo.dynamoDbDataBuilder({
      id: '123456789',
      creationDateTime: '2020-01-01T00:00:00+00:00',
      testNumber: 2,
      testBoolean: true,
    });
    expect(dynamoData).toEqual({
      id: { S: '123456789' },
      creationDateTime: { S: '2020-01-01T00:00:00+00:00' },
      testNumber: { N: 2 },
      testBoolean: { B: true },
    });
  });

  it('should build the attributes for DynamoDB after Entity is created', () => {
    const project = new Project(props);
    const dynamoData = dynamo.dynamoDbDataBuilder(project.getProps());
    expect(dynamoData).toEqual(attributes);
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