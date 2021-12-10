import {
  DynamoDBClient,
  DynamoDBClientConfig,
  CreateTableCommand,
  CreateTableCommandInput,
  PutItemCommand,
  ScanCommand,
} from '@aws-sdk/client-dynamodb';
import moment from 'moment';
import { v4 as uuid } from 'uuid';
import { Standard, StandardAttribute } from '../../models/StandardAttribute';

class DynamoDb {
  private client: DynamoDBClient;
  constructor(config: DynamoDBClientConfig) {
    this.client = new DynamoDBClient(config);
  }

  public async createTable(input: CreateTableCommandInput) {
    try {
      const command = new CreateTableCommand(input);
      const response = await this.client.send(command);
      return response;
    } catch (error) {
      console.error(error);
      throw new Error('Error when creating a table');
    }
  }

  public async listEntries<T, P>(tableName: string, entity: any): Promise<T[]> {
    try {
      const command = new ScanCommand({ TableName: tableName });
      const response = await this.client.send(command);
      if (response.Items) {
        return response.Items.map(attributes => {
          const props: P = this.attributesMapper(attributes);
          return this.create(entity, props);
        });
      }
      throw new Error(`No Items in the table: ${tableName}`);
    } catch (error) {
      console.log(error);
      const e = error as Error;
      throw new Error(e.message);
    }
  }

  public async addEntry<T extends Standard>(tableEntry: T) {
    try {
      const input = {
        TableName: tableEntry.getName(),
        Item: this.dynamoDbDataBuilder(tableEntry.getProps()),
      };
      const command = new PutItemCommand(input);
      const response = await this.client.send(command);
      return response;
    } catch (error) {
      console.error(error);
      throw new Error(`Entry with ID ${tableEntry.getId()} at ${tableEntry.getCreationDateTime()} could not be saved in ${tableEntry.getName()}`);
    }

  }

  public attributesMapper<P>(attributes: any): P {
    const keys = Object.keys(attributes);
    let result: any;
    keys.forEach(value => {
      result = { ...result, [value]: attributes[value].S };
    });
    // Deleting ID and CreationDateTime because those are standard attributes
    delete result.ID;
    delete result.CreationDateTime;
    return result;
  }

  public dynamoDbDataBuilder<P extends StandardAttribute>(props: P) {
    let result = {
      ID: {
        S: props.ID ?? uuid(),
      },
      CreationDateTime: {
        S: props.CreationDateTime ?? moment().format(),
      },
    };
    for (const key in props) {
      const attributeKeyValue = this.dynamoAttributeKeyValue({ [key]: props[key] }, key);
      result = { ...result, ...attributeKeyValue };
    }
    return result;
  }

  public dynamoAttributeKeyValue(object: any, topLevelName: string):
  { [key: string]: {[key: string]: string}} | undefined {
    for (const key in object) {
      switch (typeof object[key]) {
        case 'number':
          return { [topLevelName]: { N: object[key] } };
        case 'boolean':
          return { [topLevelName]: { B: object[key] } };
        case 'object':
          return this.dynamoAttributeKeyValue(object[key], topLevelName);
        default:
          return { [topLevelName]: { S: object[key] } };
      }
    }
    return undefined;
  }

  public create<Type, Params>(c: new (props: Params) => Type, props: Params ): Type {
    return new c(props);
  }
}

export default DynamoDb;