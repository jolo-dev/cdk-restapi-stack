import {
  DynamoDBClient,
  DynamoDBClientConfig,
  CreateTableCommand,
  CreateTableCommandInput,
  PutItemCommand,
  PutItemCommandInput,
  ListTablesCommand,
  ScanCommand,
  ScanCommandInput,
} from '@aws-sdk/client-dynamodb';

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

  public async listTables() {
    const command = new ListTablesCommand({});
    const response = await this.client.send(command);
    return response;
  }

  public async listEntries(input: ScanCommandInput) {
    try {
      const command = new ScanCommand(input);
      const response = await this.client.send(command);
      if (response.Items) {
        return response.Items;
      }
      throw new Error(`No Items in the table: ${input.TableName}`);
    } catch (error) {
      console.log(error);
      const e = error as Error;
      throw new Error(e.message);
    }

  }

  public async addEntry(input:PutItemCommandInput ) {
    const command = new PutItemCommand(input);
    const response = await this.client.send(command);
    return response;
  }
}

export default DynamoDb;