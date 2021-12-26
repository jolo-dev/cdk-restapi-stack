import { GatewayVpcEndpoint, Vpc } from '@aws-cdk/aws-ec2';
import { AnyPrincipal, Effect, PolicyStatement } from '@aws-cdk/aws-iam';
import { Bucket, CfnAccessPoint } from '@aws-cdk/aws-s3';
import { StringParameter } from '@aws-cdk/aws-ssm';
import { CfnOutput, Construct, Fn, RemovalPolicy, Stack, StackProps } from '@aws-cdk/core';
import { VpcEndpointServiceName } from '../lambda-fleet/Stack';

export class S3FleetStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    const vpcId = this.node.tryGetContext('vpcId') ?? StringParameter.valueForStringParameter(this, '/networking/vpc/id');
    const stage = process.env.STAGE ?? 'dev';
    const region = Stack.of(this).region;
    const vpc = Vpc.fromLookup(this, vpcId, { vpcId });

    const bucket = new Bucket(this, 'FourDAssetBucket', {
      removalPolicy: RemovalPolicy.DESTROY,
      bucketName: `four-d-assets-${stage}`,
    });

    bucket.addToResourcePolicy(new PolicyStatement({
      sid: 'AllowOnlyFromFourDVPC',
      effect: Effect.DENY,
      principals: [new AnyPrincipal()],
      resources: [bucket.bucketArn, `${bucket.bucketArn}/*`],
      actions: ['s3:GetObject',
        's3:ListBucket',
        's3:PutObject'],
      conditions: {
        StringNotEquals: {
          'aws:SourceVpc': vpcId,
        },
      },
    }));

    const accessPoint = new CfnAccessPoint(this, 'FourDAccesspointToBucket', {
      bucket: bucket.bucketName,
      vpcConfiguration: {
        vpcId,
      },
    });

    // Creating S3 GatewayVpcEndpoint
    const s3Endpoint = new GatewayVpcEndpoint(this, 'VPCEndpointS3', {
      vpc,
      service: {
        name: `com.amazonaws.${region}.${VpcEndpointServiceName.S3}`,
      },
    });

    s3Endpoint.addToPolicy(new PolicyStatement({
      sid: 'Access-To-4d-Bucket',
      actions: [
        's3:GetObject',
        's3:PutObject',
        's3:DeleteObject',
        's3:ListBucket',
      ],
      principals: [new AnyPrincipal()],
      effect: Effect.ALLOW,
      resources: ['*'],
    }));

    s3Endpoint.addToPolicy(new PolicyStatement({
      sid: 'OnlyIfAccessedViaAccessPoints',
      effect: Effect.DENY,
      principals: [new AnyPrincipal()],
      actions: ['*'],
      resources: ['*'],
      conditions: {
        ArnNotLikeIfExists: {
          's3:DataAccessPointArn': accessPoint.attrArn,
        },
      },
    }));

    new CfnOutput(this, 'CfnVpcEndpointS3', {
      value: s3Endpoint.vpcEndpointId,
      description: `VPCEndpoint with ServiceS3 for VPC: ${vpcId}`,
      exportName: 'VPCEndpointS3',
    });
  }
}