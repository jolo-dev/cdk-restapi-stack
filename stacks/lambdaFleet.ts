import fs from 'fs';
import { RestApi, EndpointType, LambdaIntegration } from '@aws-cdk/aws-apigateway';
import { Vpc, PrivateSubnet, IVpc, ISubnet } from '@aws-cdk/aws-ec2';
import { Code, Function, Runtime, Tracing } from '@aws-cdk/aws-lambda';
import { StringParameter } from '@aws-cdk/aws-ssm';
import { NestedStack, Construct, NestedStackProps, CfnOutput } from '@aws-cdk/core';
import { build } from 'esbuild';


export class LambdaFleetStack extends NestedStack {

  private lambdaFolder: string;
  private vpc: IVpc;
  private subnets: ISubnet[];

  constructor(scope: Construct, id: string, lambdaFolder = 'lambdas', props?: NestedStackProps) {
    super(scope, id, props);

    // Networking
    let vpcId = this.node.tryGetContext('vpcId') ?? StringParameter.valueForStringParameter(this, '/networking/vpc/id');
    this.vpc = this.getVpc(vpcId);

    let subnet1 = this.node.tryGetContext('privateSubnet1') ?? StringParameter.valueForStringParameter(this, '/networking/private-subnet-1/id');
    let subnet2 = this.node.tryGetContext('privateSubnet2') ?? StringParameter.valueForStringParameter(this, '/networking/private-subnet-2/id');
    this.subnets = [this.getPrivateSubnet(subnet1), this.getPrivateSubnet(subnet2)];

    // API Gateway
    const api = new RestApi(this, 'api', {
      description: 'Gateway for Adidas 4d',
      deployOptions: {
        stageName: 'dev',
      },
      endpointConfiguration: {
        types: [EndpointType.PRIVATE],
      },
    });

    // 👇 create an Output for the API URL
    new CfnOutput(this, 'apiUrl', { value: api.url });

    // Bundling all the Lambdas
    this.lambdaFolder = lambdaFolder;
    void this.bundlingLambdas();
    const lambdas = this.getAllLambdasFromFolder(`${this.lambdaFolder}/dist`);

    lambdas.forEach(lambda => {
      const lambdaName = lambda.replace('.js', '');
      let lambdaFunction = new Function(this, `${lambdaName}Function`, {
        runtime: Runtime.NODEJS_14_X,
        handler: `${lambdaName}.handler`,
        code: Code.fromAsset(`${this.lambdaFolder}/dist`),
        tracing: Tracing.ACTIVE,
        vpc: this.vpc,
        vpcSubnets: {
          subnets: this.subnets,
        },
      });
      let restEndpoint = api.root.addResource(lambdaName);
      restEndpoint.addMethod('GET', new LambdaIntegration(lambdaFunction, { proxy: true }));
    });
  }

  /**
   * Bundling Typescript Lambdas with esbuild to Node 14.7 code
   */
  public async bundlingLambdas() {
    const lambdas = this.getAllLambdasFromFolder(`${this.lambdaFolder}/src`);
    try {
      lambdas.forEach(async (lambda) => {

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

  public getVpc(vpcId: string) {
    return Vpc.fromLookup(this, vpcId, { vpcId });
  }

  public getPrivateSubnet(subnetId: string) {
    return PrivateSubnet.fromSubnetId(this, subnetId, subnetId);
  }
}