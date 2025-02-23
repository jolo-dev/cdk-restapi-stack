import { Vpc, PrivateSubnet, IVpc, ISubnet, InterfaceVpcEndpoint, GatewayVpcEndpoint, SecurityGroup, Peer, Port } from '@aws-cdk/aws-ec2';
import { StringParameter } from '@aws-cdk/aws-ssm';
import { Stack, Construct, CfnOutput, StackProps } from '@aws-cdk/core';
import { LambdaFleet, Method } from './LambdaFleet';
import { OpenApiDocumentation } from './OpenApiDocumentation';

import { PrivateApiGateway } from './PrivateApiGateway';

export enum VpcEndpointServiceName {
  EXECUTE_API = 'execute-api',
  DYNAMO_DB = 'dynamodb',
  S3 = 's3'
}

type VpcEndpointProps = {
  vpcEndpointId: string;
  serviceName: string;
  vpcId: string;
}
export class LambdaFleetStack extends Stack {

  private lambdaFolder: string;
  private vpc: IVpc;
  private subnets: ISubnet[];

  constructor(scope: Construct, id: string, lambdaFolder: string, props: StackProps) {
    super(scope, id, props);

    // Networking
    const vpcId = this.node.tryGetContext('vpcId') ?? StringParameter.valueForStringParameter(this, '/networking/vpc/id');
    const subnet1 = this.node.tryGetContext('privateSubnet1') ?? StringParameter.valueForStringParameter(this, '/networking/private-subnet-1/id');
    const subnet2 = this.node.tryGetContext('privateSubnet2') ?? StringParameter.valueForStringParameter(this, '/networking/private-subnet-2/id');

    this.vpc = this.getVpc(vpcId);
    this.subnets = [this.getPrivateSubnet(subnet1), this.getPrivateSubnet(subnet2)];
    this.lambdaFolder = lambdaFolder;

    const methods = [Method.GET, Method.POST, Method.PUT, Method.DELETE];
    const region = Stack.of(this).region;

    const vpceSecurityGroup = new SecurityGroup(this, 'FourD-VPCE-Sg', {
      vpc: this.vpc,
      description: 'Security Group for VPC Endpoint',
    });

    vpceSecurityGroup.addIngressRule(
      Peer.ipv4('10.0.0.0/8'),
      Port.tcp(443),
      'Access to let all Adidas machines in',
    );

    const apiGatewayVpcEndpoint = new InterfaceVpcEndpoint(this, 'VPCEndpointApiGW', {
      vpc: this.vpc,
      service: {
        name: `com.amazonaws.${region}.${VpcEndpointServiceName.EXECUTE_API}`,
        port: 443,
      },
      privateDnsEnabled: true,
      securityGroups: [vpceSecurityGroup],
    });

    this.createCfnOutputs(
      {
        vpcEndpointId: apiGatewayVpcEndpoint.vpcEndpointId,
        serviceName: VpcEndpointServiceName.EXECUTE_API,
        vpcId: this.vpc.vpcId,
      },
    );

    const dynamoDbEndpoint = new GatewayVpcEndpoint(this, 'VPCEndpointDynamoDb', {
      vpc: this.vpc,
      service: {
        name: `com.amazonaws.${region}.${VpcEndpointServiceName.DYNAMO_DB}`,
      },
    });

    this.createCfnOutputs(
      {
        vpcEndpointId: dynamoDbEndpoint.vpcEndpointId,
        serviceName: VpcEndpointServiceName.DYNAMO_DB,
        vpcId: this.vpc.vpcId,
      },
    );

    const api = new PrivateApiGateway(this, 'PrivateApiGateway', {
      region, vpcEndpoint: [apiGatewayVpcEndpoint],
    });

    // CreateOpenApi
    new OpenApiDocumentation(this, 'OpenApiDoc', {
      api,
      vpc: this.vpc,
      subnets: this.subnets,
      vpcEndpointId: apiGatewayVpcEndpoint.vpcEndpointId,
    });

    // Bundling all the Lambdas
    methods.forEach(async (method) => {
      const lambda = new LambdaFleet(this, `${method.toUpperCase()}LambdaFleet`, {
        api,
        lambdaFolder: this.lambdaFolder,
        method,
        subnets: this.subnets,
        vpc: this.vpc,
      });
      await lambda.createLambdaFunctions();
    });
  }


  public getVpc(vpcId: string) {
    return Vpc.fromLookup(this, vpcId, { vpcId });
  }

  public getPrivateSubnet(subnetId: string) {
    return PrivateSubnet.fromSubnetId(this, subnetId, subnetId);
  }

  private createCfnOutputs<T extends VpcEndpointProps>(values: T) {
    new CfnOutput(this, `CfnVpcEndpoint${values.serviceName}`, {
      value: values.vpcEndpointId,
      description: `VPCEndpoint with Service ${values.serviceName} for VPC: ${values.vpcId}`,
      exportName: `VPCEndpoint${values.serviceName}`,
    });
  }
}