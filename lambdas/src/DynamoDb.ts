import {
  DynamoDBClient,
  DynamoDBClientConfig,
  CreateTableCommand,
  CreateTableCommandInput,
  PutItemCommand,
  ScanCommand,
} from '@aws-sdk/client-dynamodb';
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

  public async listEntries<T extends Standard, P extends StandardAttribute>(tableName: string, entity: any): Promise<T[]> {
    try {
      const command = new ScanCommand({ TableName: tableName });
      const response = await this.client.send(command);
      if (response.Items) {
        return response.Items.map(attributes => {
          const attr: P = this.attributesMapper(attributes);
          // This check is needed because there are some Models which only have the Standardattributes
          if (Object.keys(attr).length > 2) {
            return this.create<T, P>(entity, attr.name, attr, attr.creationDateTime);
          }
          return this.create<T, P>(entity, attr.name, undefined, attr.creationDateTime);
        });
      }
      throw new Error(`No Items in the table: ${tableName}`);
    } catch (error) {
      console.log(error);
      const e = error as Error;
      throw new Error(e.message);
    }
  }

  // public async queryEntries<T, P>(tableName: string, entity: any): Promise<T[]> {
  //   try {
  //     return;
  //   } catch (error) {
  //     console.log(error);
  //     const e = error as Error;
  //     throw new Error(e.message);
  //   }
  // }

  public async addEntry<T extends Standard>(tableEntry: T) {
    try {
      const Item = {
        name: {
          S: tableEntry.getName(),
        },
        creationDateTime: {
          S: tableEntry.getCreationDateTime(),
        },
      };
      const input = {
        TableName: tableEntry.getTableName(),
        Item: { ...Item, ...this.dynamoDbDataBuilder(tableEntry.getProps()) },
      };
      const command = new PutItemCommand(input);
      const response = await this.client.send(command);
      return response;
    } catch (error) {
      console.error(error);
      throw new Error(`Entry '${tableEntry.getName()}' at ${tableEntry.getCreationDateTime()} could not be saved in ${tableEntry.getTableName()}`);
    }

  }

  public attributesMapper<P extends StandardAttribute>(attributes: any): P {
    const keys = Object.keys(attributes);
    let result: any;
    keys.forEach(value => {
      result = { ...result, [value]: attributes[value].S };
    });
    return result;
  }

  public dynamoDbDataBuilder<P extends StandardAttribute>(props: P) {
    let result = {};
    for (const key in props) {
      const attributeKeyValue = this.dynamoAttributeKeyValue({ [key]: props[key] }, key);
      result = { ...result, ...attributeKeyValue };
    }
    return result;
  }

  public dynamoAttributeKeyValue(object: any, topLevelName: string):
  { [key: string]: {[key: string]: string}} | undefined {
    try {
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
      throw new Error('Error in dynamoAttributeKeyValue: object cannot be undefined');
    } catch (error) {
      console.error(error);
      const e = error as Error;
      throw new Error(e.message);
    }
  }

  /**
   * Entity Class Factory by using Generics
   * @param c The class you want to generate
   * @param props the properties the class contains
   * @returns a new created class
   */
  public create<Type extends Standard, Props>
  (c: new (name: string, props?: any, creationDateTime?: string) => Type,
    name: string, props?: Props, creationDateTime?: string): Type {
    return new c(name, props, creationDateTime);
  }
}

export default DynamoDb;