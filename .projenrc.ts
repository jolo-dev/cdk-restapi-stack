import { AwsCdkTypeScriptApp, NodePackageManager } from 'projen';
const project = new AwsCdkTypeScriptApp({
  cdkVersion: '1.132.0',
  defaultReleaseBranch: 'master',
  name: '4dt-api-node',
  packageManager: NodePackageManager.PNPM,
  projenrcTs: true,
  cdkDependencies: ['@aws-cdk/core', '@aws-cdk/pipelines', '@aws-cdk/aws-lambda', '@aws-cdk/aws-codecommit'], /* Which AWS CDK modules (those that start with "@aws-cdk/") this app uses. */
  disableTsconfig: true, // we use the https://github.com/tsconfig/bases/
  github: false, // Because we are not on github
  // deps: [],                          /* Runtime dependencies of this module. */
  description: 'Infrastructure written in CDK', /* The description is just a string that helps people understand the purpose of the package. */
  devDeps: ['@tsconfig/recommended'], /* Build dependencies for this module. */
  // packageName: undefined,            /* The "name" in package.json. */
  // projectType: ProjectType.UNKNOWN,  /* Which type of project this is (library/app). */
  // releaseWorkflow: undefined,        /* Define a GitHub workflow for releasing from "main" when new versions are bumped. */
});
project.synth();