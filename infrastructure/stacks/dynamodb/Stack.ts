import fs from 'fs';
import { AttributeType, BillingMode, ProjectionType, Table } from '@aws-cdk/aws-dynamodb';
import { CfnOutput, Construct, Stack, StackProps } from '@aws-cdk/core';

export class DynamoDbStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps, modelsFolder: string = 'models') {
    super(scope, id, props);
    fs.readdirSync(modelsFolder)
      .filter(model => model !== 'StandardAttribute.ts') // Is a standard attribute
      .forEach(value => {
        const tableName = value.replace('.ts', '') + 's'; // Appending an 's' to name it in Plural
        const table = new Table(this, `${tableName}Table`, {
          partitionKey: { name: 'name', type: AttributeType.STRING },
          sortKey: { name: 'creationDateTime', type: AttributeType.STRING },
          billingMode: BillingMode.PAY_PER_REQUEST,
          tableName,
        });
        table.addGlobalSecondaryIndex({
          indexName: `${tableName}GSI`,
          partitionKey: { name: 'name', type: AttributeType.STRING },
          projectionType: ProjectionType.KEYS_ONLY,
        });
        new CfnOutput(this, `TableName${tableName}`, {
          value: table.tableName,
          description: `DynamoDB TableName for ${tableName}`,
        });
        new CfnOutput(this, `TableArn${tableName}`, {
          value: table.tableArn,
          description: `DynamoDB TableArn for ${tableName}`,
        });
      });
  }
}