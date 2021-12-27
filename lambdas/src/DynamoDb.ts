import {
  DynamoDBClient,
  DynamoDBClientConfig,
  CreateTableCommand,
  CreateTableCommandInput,
  PutItemCommand,
  ScanCommand,
  DeleteItemCommand,
  GetItemCommand,
} from '@aws-sdk/client-dynamodb';
import { Standard, StandardAttribute } from '../../models/StandardAttribute';

class DynamoDb {
  private client: DynamoDBClient;
  constructor( config: DynamoDBClientConfig ) {
    this.client = new DynamoDBClient( config );
  }

  public async createTable( input: CreateTableCommandInput ) {
    try {
      const command = new CreateTableCommand( input );
      const response = await this.client.send( command );
      return response;
    } catch ( error ) {
      console.error( error );
      throw new Error( 'Error when creating a table' );
    }
  }

  public async listEntries<T extends Standard, P extends StandardAttribute>( tableName: string, entity: any ): Promise<T[]> {
    try {
      const command = new ScanCommand( { TableName: tableName } );
      const response = await this.client.send( command );
      if ( response.Items ) {
        return response.Items.map( attributes => {
          const attr: P = this.attributesMapper( attributes );
          // This check is needed because there are some Models which only have the Standardattributes
          if ( Object.keys( attr ).length > 2 ) {
            const object = this.create<T, P>( entity, attr.name, attr, attr.creationDateTime );
            delete object.getProps().creationDateTime; // remove redundant information
            return object;
          }
          return this.create<T, P>( entity, attr.name, undefined, attr.creationDateTime );
        } );
      }
      throw new Error( `No Items in the table: ${tableName}` );
    } catch ( error ) {
      console.log( error );
      const e = error as Error;
      throw new Error( e.message );
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

  public async getItem<P extends StandardAttribute>(tableName: string, name: string): Promise<P> {
    try {
      const command = new GetItemCommand({ TableName: tableName, Key: { name: { S: name } } });
      const result = await this.client.send(command);
      if (result.Item) {
        const props: P = this.attributesMapper(result.Item);
        return props;
      } else {
        throw new Error(`Couldn't find ${name} in ${tableName}`);
      }
    } catch (error) {
      console.error(error);
      const e = error as Error;
      throw new Error(e.message);
    }
  }

  /**
   * Deletes an entry from its table
   * @param tableName string Name of the table
   * @param name string Name of the entity
   * @returns DeleteItemCommandOutput
   */
  public async deleteEntry(tableName: string, name: string) {
    try {
      const command = new DeleteItemCommand({
        TableName: tableName,
        Key: {
          name: {
            S: name,
          },
        },
      });
      const result = await this.client.send(command);
      if (result.$metadata.httpStatusCode !== 200) {
        throw new Error(`Error in deleting the ${name} in ${tableName}`);
      }
      return result;
    } catch (error) {
      console.error(error);
      const e = error as Error;
      throw new Error(e.message);

    }
  }

  /**
   * It adds an entry of a model.
   * @param tableEntry Entry of the Table with its type
   * @returns PutItemCommandOutput
   */
  public async addEntry<T extends Standard>( tableEntry: T ) {
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
        Item: { ...Item, ...this.dynamoDbDataBuilder( tableEntry.getProps() ) },
      };
      const command = new PutItemCommand( input );
      const response = await this.client.send( command );
      return response;
    } catch ( error ) {
      console.error( error );
      throw new Error( `Entry '${tableEntry.getName()}' at ${tableEntry.getCreationDateTime()} could not be saved in ${tableEntry.getTableName()}` );
    }

  }

  /**
 * This function stripes out the typical { S: 'foo' } of any object of DynamoDb. E.g. { foo: {S: 'bar'} } becomes { foo: 'bar' }
 * @param attributes object which has no structure.
 * @returns object
 */
  public attributesMapper<P extends StandardAttribute>( attributes: any ): P {
    const keys = Object.keys( attributes );
    let result: any;
    keys.forEach( value => {
      if ('S' in attributes[value]) {
        result = { ...result, [value]: attributes[value].S };
      }
      if ('N' in attributes[value]) {
        result = { ...result, [value]: Number(attributes[value].N) };
      }
      if ('BOOL' in attributes[value]) {
        const bool = attributes[value].BOOL === 'true';
        result = { ...result, [value]: bool };
      }
      if ('L' in attributes[value]) {
        const values = attributes[value].L as Array<any>;
        const foo = values.map(val => {
          if ('S' in val) {
            return val.S;
          }
          if ('N' in val) {
            return Number(val.N);
          }
          if ('BOOL' in val) {
            return val.BOOL === 'true';
          }
        });
        result = { ...result, [value]: foo };
      }
    } );
    return result;
  }

  /**
   * Helper to merge all the attributes to a DynamoDB-Object
   * @param props Generic value which should be part of the Standardattribute
   * @returns object e.g. { foo: { S: 'bar' }, baz: { N: 123456789 } }
   */
  public dynamoDbDataBuilder<P extends StandardAttribute>( props: P ) {
    let result = {};
    for ( const key in props ) {
      const attributeKeyValue = this.dynamoAttributeKeyValue( { [key]: props[key] }, key );
      result = { ...result, ...attributeKeyValue };
    }
    return result;
  }

  /**
   * Helper to map the toplevel with correct DynamoDB-Object. S = String, N = Number, B = Boolean
   * In case of deep nesting, it recursively checking the next object (Performance issue when it is very deep nested).
   * @params object any
   * @params topLevelName objects can be nested
   * @returns object e.g. { attribute: { S: 'foo' } }
   */
  public dynamoAttributeKeyValue( object: any, topLevelName: string ):
  { [key: string]: { [key: string]: string }
  | {[key: string]: { [key: string]: string }[]}; }
  | undefined {
    try {
      for ( const key in object ) {
        switch ( typeof object[key] ) {
          case 'number':
            return { [topLevelName]: { N: object[key] } };
          case 'boolean':
            return { [topLevelName]: { B: object[key] } };
          case 'object':
            if (Array.isArray(object[key])) {
              const objects = object[key] as Array<string | number | boolean>;
              const listOfObjects = objects.map(obj => {
                const foo: any = this.dynamoAttributeKeyValue({ foo: obj }, 'bar');
                return foo.bar;
              });
              return { [topLevelName]: { L: listOfObjects } };
            }
            // An Array is also an object
            return this.dynamoAttributeKeyValue( object[key], topLevelName );
          default:
            return { [topLevelName]: { S: object[key] } };
        }
      }
      throw new Error( 'Error in dynamoAttributeKeyValue: object cannot be undefined' );
    } catch ( error ) {
      console.error( error );
      const e = error as Error;
      throw new Error( e.message );
    }
  }

  /**
   * Entity Class Factory by using Generics
   * @param c The class you want to generate
   * @param props the properties the class contains
   * @param creationDateTime the creationDateTime --> that is mainly for outputting otherwise it would generate the current datetime
   * @returns a new created class
   */
  public create<Type extends Standard, Props>
  ( c: new ( name: string, props?: any, creationDateTime?: string ) => Type,
    name: string, props?: Props, creationDateTime?: string ): Type {
    return new c( name, props, creationDateTime );
  }
}

export default DynamoDb;