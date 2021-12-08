import { awscdk, javascript as js } from 'projen';
import { getNetworkingContext } from './src/utils/getContext';


const getOptions = async() : Promise<awscdk.AwsCdkTypeScriptAppOptions> => {
  const context = await getNetworkingContext();
  return {
    cdkVersion: '1.134.0',
    defaultReleaseBranch: 'master',
    name: '4dt-api-node',
    packageManager: js.NodePackageManager.PNPM,
    projenrcTs: true,
    cdkDependencies: ['@aws-cdk/core',
      '@aws-cdk/aws-codepipeline',
      '@aws-cdk/aws-lambda',
      '@aws-cdk/aws-apigateway',
      '@aws-cdk/aws-codecommit',
      '@aws-cdk/aws-codebuild',
      '@aws-cdk/aws-events-targets',
      '@aws-cdk/aws-codepipeline-actions',
      '@aws-cdk/aws-ssm',
      '@aws-cdk/aws-ec2',
      '@aws-cdk/aws-iam',
      '@aws-cdk/aws-dynamodb'], /* Which AWS CDK modules (those that start with "@aws-cdk/") this app uses. */
    disableTsconfig: true, // we use the https://github.com/tsconfig/bases/
    github: false, // Because we are not on github
    deps: ['dotenv', 'esbuild', '@aws-sdk/client-ssm', '@aws-sdk/client-service-catalog', '@aws-sdk/util-waiter', 'moment', 'uuid'], /* Runtime dependencies of this module. */
    description: 'Infrastructure written in CDK', /* The description is just a string that helps people understand the purpose of the package. */
    devDeps: ['@tsconfig/recommended', 'husky', 'aws-sdk-client-mock', '@types/uuid'], /* Build dev dependencies for this module. */
    gitignore: ['.env', 'dist', '.DS_Store', 'test-reports'],
    context,
    jestOptions: { configFilePath: './jest.config.json', jestConfig: { projects: ['<rootDir>/src'] } },
    tsconfigDev: {
      compilerOptions: {},
      include: ['**/*.ts'],
    },
    watchIncludes: ['src/**', 'lambdas/src/**', 'models/**'],
  };
};

getOptions().then(options => {
  const project = new awscdk.AwsCdkTypeScriptApp(options);
  project.removeTask('deploy');
  project.removeTask('destroy');
  project.setScript('deploy', 'npx cdk deploy --all');
  project.setScript('destroy', 'npx cdk destroy FourD-LambdaFleetStack');
  project.setScript('watch', 'npx cdk watch FourD-LambdaFleetStack FourD-DynamoDbStack');
  project.synth();
}).catch(error => {
  console.log(error);
});


