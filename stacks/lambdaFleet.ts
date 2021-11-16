import fs from 'fs';
import { Code, Function, Runtime, Tracing } from '@aws-cdk/aws-lambda';
import { Stack, Construct, StackProps } from '@aws-cdk/core';
import { build } from 'esbuild';

export class LambdaFleetStack extends Stack {

  private lambdaFolder: string;

  constructor(scope: Construct, id: string, lambdaFolder = 'lambdas', props?: StackProps) {
    super(scope, id, props);
    this.lambdaFolder = lambdaFolder;
    void this.orchestrate();

    const lambdas = this.getAllLambdasFromFolder(`${this.lambdaFolder}/dist`);

    lambdas.forEach(lambda => {
      const lambdaName = lambda.replace('.js', '');
      console.log('Creating this badass: ' + lambdaName);
      new Function(this, `${lambdaName}Function`, {
        runtime: Runtime.NODEJS_14_X,
        handler: `${lambdaName}.handler`,
        code: Code.fromAsset(`${this.lambdaFolder}/dist`),
        tracing: Tracing.ACTIVE,
      });
    });
  }

  public async orchestrate() {
    await this.bundlingLambdas();
  }

  /**
   * Bundling Typescript Lambdas with esbuild to Node 14.7 code
   */
  public async bundlingLambdas() {
    const lambdas = this.getAllLambdasFromFolder(`${this.lambdaFolder}/src`);
    try {
      lambdas.forEach(async (lambda) => {
        console.log(`Bundling this badass: ${lambda}`);

        await build({
          bundle: true,
          minify: true,
          platform: 'node',
          target: 'node14.7',
          outdir: `${this.lambdaFolder}/dist`,
          entryPoints: [`${this.lambdaFolder}/src/${lambda}`],
        });

      });

    } catch (error) {
      console.error(error);
      throw Error('Error while bundling Lambda in: ' + this.lambdaFolder);
    };
  }

  /**
   * Utility Method to read the content of the folder
   * @param folder string to read the content of the given director
   * @returns string[]
   */
  public getAllLambdasFromFolder(folder: string) {
    try {
      return fs.readdirSync(folder);
    } catch (error) {
      console.error(error);
      throw Error(`Cannot find folder: ${folder}`);
    }

  }
}