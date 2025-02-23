import {
  DynamoDBClient,
  CreateTableCommand,
  ScanCommand,
  PutItemCommand,
  DeleteItemCommand,
  GetItemCommand,
} from '@aws-sdk/client-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';
import { I4DProject, Project } from '../../models/Project';
import { StandardAttribute } from '../../models/StandardAttribute';
import { Tag } from '../../models/Tag';
import DynamoDb from '../src/DynamoDb';

Date.now = jest.fn().mockReturnValue(new Date('2020-01-01T00:00:00.000'));

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

  describe('createTable', () => {
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
  });

  describe('listEntries', () => {
    it('should scan the whole Projects table', async () => {
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

    it('should scan the whole Tags table', async () => {
      ddbMock.on(ScanCommand).resolves({
        Items: [{
          name: { S: 'TestProject' },
          creationDateTime: { S: '2020-01-01T00:00:00+01:00' },
        }],
      });
      const entries = await dynamo.listEntries<Tag, StandardAttribute>('Tags', Tag);
      expect(entries.length).toBeGreaterThan(0);
    });

  });

  describe('create', () => {
    it('should create a Project object with props', () => {
      const project = dynamo.create<Project, I4DProject>(Project, props.name, props);
      expect(project).toEqual(new Project(props.name, props));
    });

    it('should create a Tag object without props', () => {
      const tag = dynamo.create<Tag, StandardAttribute>(Tag, props.name);
      expect(tag).toEqual(new Tag(props.name));
    });

    it('should create a Project object with props and a creationDateTime', () => {
      const project = dynamo.create<Project, I4DProject>(Project, props.name, props, props.creationDateTime);
      expect(project).toEqual(new Project(props.name, props, props.creationDateTime));
    });
  });

  describe('addEntry', () => {
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
  });

  describe('getItem', () => {
    it('should get an the item based on key', async () => {
      ddbMock.on(GetItemCommand).resolves({
        Item: {
          name: {
            S: 'foo',
          },
        },
      });
      const result = await dynamo.getItem('Projects', 'Test');
      expect(result).toEqual({ name: 'foo' });
    });

    it('should throw because there is no item', async () => {
      ddbMock.on(GetItemCommand).resolves({});
      await expect(dynamo.getItem('Projects', 'Test')).rejects.toThrowError('Couldn\'t find Test in Projects');
    });

    it('should throw when GetItemCommand failed', async () => {
      ddbMock.on(GetItemCommand).rejects();
      await expect(dynamo.getItem('Projects', 'Test')).rejects.toThrowError();
    });
  });

  describe('attributesMapper', () => {
    it('should map the dynamoDbAttributes with strings', () => {
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

    it('should map the dynamoDbAttributes with a number and a boolean', () => {
      const projectProps = dynamo.attributesMapper({
        number: { N: '123' },
        boolean: { BOOL: 'true' },
      });
      expect(projectProps).toEqual({
        number: 123,
        boolean: true,
      });
    });

    it('should map the dynamoDbAttributes with a list of strings, numbers and booleans', () => {
      const projectProps = dynamo.attributesMapper({
        strings: { L: [{ S: 'lorem' }, { S: 'ipsum' }] },
        numbers: { L: [{ N: '123' }, { N: '456' }] },
        booleans: { L: [{ BOOL: 'true' }, { BOOL: 'false' }] },
      });
      expect(projectProps).toEqual({
        strings: ['lorem', 'ipsum'],
        numbers: [123, 456],
        booleans: [true, false],
      });
    });
  });

  describe('dynamoDbDataBuilder', () => {
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
  });

  describe('dynamoAttributeKeyValue', () => {
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

  describe('deleteEntry', () => {
    it('should delete an entry from table', async () => {
      ddbMock.on(DeleteItemCommand).resolves({
        $metadata: {
          httpStatusCode: 200,
        },
      });
      const result = await dynamo.deleteEntry('Test', 'name');
      expect(result.$metadata.httpStatusCode).toBe(200);
    });

    it('should throw when httpStatusCode = 400', async () => {
      ddbMock.on(DeleteItemCommand).resolves({
        $metadata: {
          httpStatusCode: 400,
        },
      });
      await expect(dynamo.deleteEntry('Test', 'name')).rejects.toThrowError('Error in deleting the name in Test');
    });

    it('should throw when deleting failed', async () => {
      ddbMock.on(DeleteItemCommand).rejects();
      await expect(dynamo.deleteEntry('Test', 'name')).rejects.toThrowError();
    });
  });

});