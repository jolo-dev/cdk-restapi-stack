import fs from 'fs';
import { LambdaIntegration } from '@aws-cdk/aws-apigateway';
import { ISubnet, IVpc } from '@aws-cdk/aws-ec2';
import { Effect, PolicyStatement } from '@aws-cdk/aws-iam';
import { Code, Function, Runtime, Tracing } from '@aws-cdk/aws-lambda';
import { Construct, Stack } from '@aws-cdk/core';
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
  private api: PrivateApiGateway;
  private method: Method;
  private vpc: IVpc;
  private subnets: ISubnet[];

  constructor(scope: Construct, id: string, props: LambdaFleetProps) {
    super(scope, id);
    this.lambdaFolder = props.lambdaFolder;
    this.api = props.api;
    this.method = props.method;
    this.vpc = props.vpc;
    this.subnets = props.subnets;
    void this.bundlingLambdas(this.method);
  }

  public async createLambdaFunctions() {
    const lambdaFolder = `${this.lambdaFolder}/dist/${this.method}`;
    if (fs.existsSync(lambdaFolder)) {
      const lambdas = this.getAllLambdasFromFolder(lambdaFolder);
      lambdas.forEach(lambda => {
        const lambdaName = lambda.replace('.js', '');
        const lambdaFunction = new Function(this, `${this.method}${lambdaName}Function`, {
          runtime: Runtime.NODEJS_14_X,
          handler: `${lambdaName}.handler`,
          code: Code.fromAsset(lambdaFolder),
          tracing: Tracing.ACTIVE,
          vpc: this.vpc,
          vpcSubnets: {
            subnets: this.subnets,
          },
        });

        const region = Stack.of(this).region;
        const account = Stack.of(this).account;
        const policy = new PolicyStatement({
          actions: ['*'],
          resources: [`arn:aws:dynamodb:${region}:${account}:table/*`],
          effect: Effect.ALLOW,
        });
        lambdaFunction.addToRolePolicy(policy);

        // Add Lambda to API Gateway
        const restEndpoint = this.api.root.addResource(lambdaName);
        restEndpoint.addMethod(this.method,
          new LambdaIntegration(lambdaFunction, { proxy: false, integrationResponses: [{ statusCode: '200' }, { statusCode: '400' }, { statusCode: '404' }] }),
          { methodResponses: [{ statusCode: '200' }, { statusCode: '400' }, { statusCode: '404' }] },
        );
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