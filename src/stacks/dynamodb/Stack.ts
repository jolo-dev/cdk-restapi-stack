import fs from 'fs';
import { AttributeType, BillingMode, ProjectionType, Table } from '@aws-cdk/aws-dynamodb';
import { CfnOutput, Construct, NestedStack } from '@aws-cdk/core';

export class DynamoDbStack extends NestedStack {
  constructor(scope: Construct, id: string) {
    super(scope, id);
    fs.readdirSync('models').forEach(value => {
      const tableName = value.replace('.ts', '');
      const table = new Table(this, `${tableName}Table`, {
        partitionKey: { name: 'ID', type: AttributeType.STRING },
        sortKey: { name: 'CreationDateTime', type: AttributeType.STRING },
        billingMode: BillingMode.PAY_PER_REQUEST,
        tableName,
      });
      table.addGlobalSecondaryIndex({
        indexName: `${tableName}GSI`,
        partitionKey: { name: 'ID', type: AttributeType.STRING },
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