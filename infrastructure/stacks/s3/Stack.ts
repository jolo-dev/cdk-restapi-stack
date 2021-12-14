import { PolicyStatement, Effect, AnyPrincipal } from '@aws-cdk/aws-iam';
import { Bucket } from '@aws-cdk/aws-s3';
import { BucketDeployment, Source } from '@aws-cdk/aws-s3-deployment';
import { Construct, RemovalPolicy, Stack, StackProps } from '@aws-cdk/core';

export class S3FleetStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    const openapiBucket = new Bucket(this, 'OpenApiSwaggerBucket', {
      websiteIndexDocument: 'index.html',
      publicReadAccess: false,
      removalPolicy: RemovalPolicy.DESTROY,
      bucketName: 'four-d-openapi',
    });

    openapiBucket.addToResourcePolicy(new PolicyStatement({
      sid: 'OpenApiBucket-Readonly',
      effect: Effect.DENY,
      actions: [
        's3:GetObject',
      ],
      conditions: {
        NotIpAddress: {
          'aws:SourceIp': ['87.237.218.164/32'],
        },
      },
      principals: [new AnyPrincipal()],
    }));


    new BucketDeployment(this, 'DeployWebsite', {
      sources: [Source.asset('infrastructure/openapi')],
      destinationBucket: openapiBucket,
      destinationKeyPrefix: 'openapi',
    });
  }
}