import fs from 'fs';
import { LambdaIntegration } from '@aws-cdk/aws-apigateway';
import { ISubnet, IVpc } from '@aws-cdk/aws-ec2';
import { Code, Function, Runtime, Tracing } from '@aws-cdk/aws-lambda';
import { Construct } from '@aws-cdk/core';
import { build } from 'esbuild';
import { PrivateApiGateway } from './PrivateApiGateway';

export enum Method {
  GET = 'get',
  POST = 'post',
  PUT = 'put',
  DELETE = 'delete'
}

interface LambdaFleetProps {
  lambdaFolder: string;
  api: PrivateApiGateway;
  method: Method;
  vpc: IVpc;
  subnets: ISubnet[];
}

export class LambdaFleet extends Construct {
  private lambdaFolder: string;

  constructor(scope: Construct, id: string, props: LambdaFleetProps) {
    super(scope, id);
    this.lambdaFolder = props.lambdaFolder;

    void this.bundlingLambdas(props.method);
    const lambdaFolder = `${this.lambdaFolder}/dist/${props.method}`;
    if (fs.existsSync(lambdaFolder)) {
      const lambdas = this.getAllLambdasFromFolder(lambdaFolder);
      lambdas.forEach(lambda => {
        const lambdaName = lambda.replace('.js', '');
        const lambdaFunction = new Function(scope, `${props.method}${lambdaName}Function`, {
          runtime: Runtime.NODEJS_14_X,
          handler: `${lambdaName}.handler`,
          code: Code.fromAsset(lambdaFolder),
          tracing: Tracing.ACTIVE,
          vpc: props.vpc,
          vpcSubnets: {
            subnets: props.subnets,
          },
        });
        const restEndpoint = props.api.root.addResource(lambdaName);
        restEndpoint.addMethod(props.method, new LambdaIntegration(lambdaFunction, { proxy: true }));
      });
    }
  }

  /**
   * Bundling Typescript Lambdas with esbuild to Node 14.7 code
   */
  public async bundlingLambdas(method: Method) {
    const entryPoint = `${this.lambdaFolder}/src/${method}`;
    if (fs.existsSync(entryPoint)) {
      const lambdas = this.getAllLambdasFromFolder(entryPoint);
      try {
        if (lambdas.length > 0) {
          lambdas.forEach(async (lambda) => {

            await build({
              bundle: true,
              minify: true,
              platform: 'node',
              target: 'node14.7',
              outdir: `${this.lambdaFolder}/dist/${method}`,
              entryPoints: [`${entryPoint}/${lambda}`],
            });

          });
        } else {
          throw new Error(`Error while bundling Lambda in: ${entryPoint}`);
        }
      } catch (error) {
        console.error(error);
        throw new Error;
      };
    }
    return;
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