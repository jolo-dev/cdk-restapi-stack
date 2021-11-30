import { Vpc, PrivateSubnet, IVpc, ISubnet } from '@aws-cdk/aws-ec2';
import { StringParameter } from '@aws-cdk/aws-ssm';
import { NestedStack, Construct, Stack } from '@aws-cdk/core';
import { LambdaFleet, Method } from './LambdaFleet';

import { PrivateApiGateway } from './PrivateApiGateway';
import { VpcEndpoint, VpcEndpointServiceName } from './VpcEndpoint';


export class LambdaFleetStack extends NestedStack {

  private lambdaFolder: string;
  private vpc: IVpc;
  private subnets: ISubnet[];

  constructor(scope: Construct, id: string, lambdaFolder = 'lambdas') {
    super(scope, id);

    // Networking
    let vpcId = this.node.tryGetContext('vpcId') ?? StringParameter.valueForStringParameter(this, '/networking/vpc/id');
    let subnet1 = this.node.tryGetContext('privateSubnet1') ?? StringParameter.valueForStringParameter(this, '/networking/private-subnet-1/id');
    let subnet2 = this.node.tryGetContext('privateSubnet2') ?? StringParameter.valueForStringParameter(this, '/networking/private-subnet-2/id');

    this.vpc = this.getVpc(vpcId);
    this.subnets = [this.getPrivateSubnet(subnet1), this.getPrivateSubnet(subnet2)];
    this.lambdaFolder = lambdaFolder;

    const methods = [Method.GET, Method.POST, Method.PUT, Method.DELETE];
    const region = Stack.of(this).region;

    const apiGatewayVpcEndpoint = new VpcEndpoint(scope, 'ApiGatewayEndpoint', {
      region,
      serviceName: 'ApiGatewayVpcEndpoint',
      vpc: this.vpc,
      service: {
        name: `com.amazonaws.${region}.${VpcEndpointServiceName.EXECUTE_API}`,
        port: 443,
      },
    });

    const dynamoDbEndpoint = new VpcEndpoint(scope, 'DynamoDbEndpoint', {
      region,
      serviceName: 'DynamoDbEndpoint',
      vpc: this.vpc,
      service: {
        name: `com.amazonaws.${region}.${VpcEndpointServiceName.DYNAMO_DB}`,
        port: 443,
      },
    });

    const api = new PrivateApiGateway(scope, 'PrivateApiGateway', {
      region, vpsEndpoint: [apiGatewayVpcEndpoint, dynamoDbEndpoint],
    });

    // Bundling all the Lambdas
    methods.forEach(async (method) => {
      new LambdaFleet(scope, `${method.toUpperCase()}LambdaFleet`, {
        api,
        lambdaFolder: this.lambdaFolder,
        method,
        subnets: this.subnets,
        vpc: this.vpc,
      });
    });
  }


  public getVpc(vpcId: string) {
    return Vpc.fromLookup(this, vpcId, { vpcId });
  }

  public getPrivateSubnet(subnetId: string) {
    return PrivateSubnet.fromSubnetId(this, subnetId, subnetId);
  }
}