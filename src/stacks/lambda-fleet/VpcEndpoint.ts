import { InterfaceVpcEndpoint, InterfaceVpcEndpointProps, IVpc } from '@aws-cdk/aws-ec2';
import { CfnOutput, Construct } from '@aws-cdk/core';

export enum VpcEndpointServiceName {
  EXECUTE_API = 'execute-api',
  DYNAMO_DB = 'dynamodb',
  S3 = 's3'
}

type VpcEndpointProps = InterfaceVpcEndpointProps & {
  serviceName: string;
  region: string;
  vpc: IVpc;
}

export class VpcEndpoint extends InterfaceVpcEndpoint {
  readonly vpcEndpoint: InterfaceVpcEndpoint;
  readonly props: VpcEndpointProps;
  constructor(scope: Construct, id: string, props: VpcEndpointProps) {
    super(scope, id, props);
    this.props = props;
    this.vpcEndpoint = new InterfaceVpcEndpoint(this, `VPCEndpoint${this.props.serviceName}`, {
      vpc: props.vpc,
      service: props.service,
      privateDnsEnabled: true,
    });

    this.createCfnOutputs();
  }

  public getVpcEndpoint() {
    return this.vpcEndpoint;
  }

  private createCfnOutputs() {
    new CfnOutput(this, 'CfnvpcEndpointReference', {
      value: this.vpcEndpointId,
      description: `VPCEndpoint with Service ${this.props.service} for VPC: ${this.props.vpc.vpcId}`,
      exportName: `VPCEndpoint${this.props.service}`,
    });
  }
}