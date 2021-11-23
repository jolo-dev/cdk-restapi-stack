import { AwsCdkTypeScriptApp, NodePackageManager } from 'projen';
const project = new AwsCdkTypeScriptApp( {
  cdkVersion: '1.132.0',
  defaultReleaseBranch: 'master',
  name: '4dt-api-node',
  packageManager: NodePackageManager.PNPM,
  projenrcTs: true,
  cdkDependencies: ['@aws-cdk/core',
    '@aws-cdk/aws-codepipeline',
    '@aws-cdk/aws-lambda',
    '@aws-cdk/aws-codecommit',
    '@aws-cdk/aws-codebuild',
    '@aws-cdk/aws-events-targets',
    '@aws-cdk/aws-codepipeline-actions',
    '@aws-cdk/aws-ssm',
    '@aws-cdk/aws-ec2'], /* Which AWS CDK modules (those that start with "@aws-cdk/") this app uses. */
  disableTsconfig: true, // we use the https://github.com/tsconfig/bases/
  github: false, // Because we are not on github
  deps: ['dotenv', 'esbuild', '@aws-sdk/client-ssm', '@aws-sdk/client-service-catalog'], /* Runtime dependencies of this module. */
  description: 'Infrastructure written in CDK', /* The description is just a string that helps people understand the purpose of the package. */
  devDeps: ['@tsconfig/recommended', 'husky', 'aws-cdk-local', 'aws-sdk-client-mock'], /* Build dependencies for this module. */
  gitignore: ['.env', 'dist', '.DS_Store'],
  // context: { vpcId: 'vpc-0cf0f347d9419f482', privateSubnet1: 'subnet-000002e57b2221a06', privateSubnet2: 'subnet-000002e57b2221a07' },
} );
project.setScript('local', 'cdklocal');
project.synth();