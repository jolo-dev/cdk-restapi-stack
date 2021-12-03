import {
  DynamoDBClient,
  DynamoDBClientConfig,
  CreateTableCommand,
  CreateTableCommandInput,
  DeleteTableCommand,
  DeleteTableCommandInput,
  PutItemCommand,
  PutItemCommandInput,
  ListTablesCommand,
  ScanCommand,
} from '@aws-sdk/client-dynamodb';
import { I4DProject, Project } from '../../models/Project';

class DynamoDb {
  private client: DynamoDBClient;
  constructor(config: DynamoDBClientConfig) {
    this.client = new DynamoDBClient(config);
  }

  public async createTable(input: CreateTableCommandInput) {
    const command = new CreateTableCommand(input);
    const response = await this.client.send(command);
    return response;
  }

  public async deleteTable(input: DeleteTableCommandInput) {
    const command = new DeleteTableCommand(input);
    const response = await this.client.send(command);
    return response;
  }

  public async listTables() {
    const command = new ListTablesCommand({});
    const response = await this.client.send(command);
    return response;
  }

  public async listEntries(tableName: string): Promise<Project[]> {
    try {
      const command = new ScanCommand({ TableName: tableName });
      const response = await this.client.send(command);
      if (response.Items) {
        return response.Items.map(attributes => {
          const props: I4DProject = this.attributesMapper(attributes);
          return new Project(props);
        });
      }
      throw new Error(`No Items in the table: ${tableName}`);
    } catch (error) {
      console.log(error);
      const e = error as Error;
      throw new Error(e.message);
    }

  }

  // public create<Type>(c: new (props: AttributeValue[]) => Type ): Type {
  //   return new c(props);
  // }

  public attributesMapper(attributes: any) {
    const keys = Object.keys(attributes);
    let result: any;
    keys.forEach(value => {
      result = { ...result, [value]: attributes[value].S };
    });
    return result;
  }

  public async addEntry(input:PutItemCommandInput ) {
    const command = new PutItemCommand(input);
    const response = await this.client.send(command);
    return response;
  }
}

export default DynamoDb;