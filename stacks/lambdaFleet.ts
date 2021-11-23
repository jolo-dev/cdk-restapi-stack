import fs from 'fs';
import { Vpc, PrivateSubnet, IVpc, ISubnet } from '@aws-cdk/aws-ec2';
import { Code, Function, Runtime, Tracing } from '@aws-cdk/aws-lambda';
import { StringParameter } from '@aws-cdk/aws-ssm';
import { NestedStack, Construct, NestedStackProps } from '@aws-cdk/core';
import { ProvisioningParameter } from '@aws-sdk/client-service-catalog';
import { build } from 'esbuild';
import { ServiceCatalogProduct } from '../src/ServiceCatalog';


export class LambdaFleetStack extends NestedStack {

  private lambdaFolder: string;
  private vpc: IVpc;
  private subnets: ISubnet[];

  constructor(scope: Construct, id: string, lambdaFolder = 'lambdas', props?: NestedStackProps) {
    super(scope, id, props);

    // Networking
    // 1. Check if there is a vpc product-id in the SSM Parameter store
    let vpcId = this.node.tryGetContext('vpcId') ?? StringParameter.valueForStringParameter(this, '/networking/vpc/id');
    // 2. If there is no product-id, then we need to provision a new VPC coming from the Service Catalog of Adidas
    // https://tools.adidas-group.com/confluence/pages/viewpage.action?spaceKey=CES&title=Service+Catalogue
    if (vpcId === undefined) {
      this.callServiceCatalogProduct('vpc', [{ Key: 'Application', Value: 'vpc' }]).then(result => {
        vpcId = result!;
      }).catch(error => {
        console.log(error);
      });
    }
    this.vpc = this.getVpc(vpcId);

    let subnet1 = this.node.tryGetContext('privateSubnet1') ?? StringParameter.valueForStringParameter(this, '/networking/private-subnet-1/id');
    let subnet2 = this.node.tryGetContext('privateSubnet2') ?? StringParameter.valueForStringParameter(this, '/networking/private-subnet-2/id');
    if (subnet1 === undefined && subnet2 === undefined) {
      this.callServiceCatalogProduct('private-subnet-1', [{ Key: 'VPCId', Value: vpcId }, { Key: 'AvailabilityZone', Value: 'eu-west-1a' }]).then(result => {
        subnet1 = result!;
      }).catch(error => {
        console.log(error);
      });
      this.callServiceCatalogProduct('private-subnet-2', [{ Key: 'VPCId', Value: vpcId }, { Key: 'AvailabilityZone', Value: 'eu-west-1b' }]).then(result => {
        subnet2 = result!;
      }).catch(error => {
        console.log(error);
      });
    }

    this.subnets = [this.getPrivateSubnet(subnet1), this.getPrivateSubnet(subnet2)];

    // Bundling all the Lambdas
    this.lambdaFolder = lambdaFolder;
    void this.bundlingLambdas();
    const lambdas = this.getAllLambdasFromFolder(`${this.lambdaFolder}/dist`);

    lambdas.forEach(lambda => {
      const lambdaName = lambda.replace('.js', '');
      new Function(this, `${lambdaName}Function`, {
        runtime: Runtime.NODEJS_14_X,
        handler: `${lambdaName}.handler`,
        code: Code.fromAsset(`${this.lambdaFolder}/dist`),
        tracing: Tracing.ACTIVE,
        vpc: this.vpc,
        vpcSubnets: {
          subnets: this.subnets,
        },
      });
    });
  }

  public async callServiceCatalogProduct(product: string, provisionParameters: NonNullable<ProvisioningParameter[]>) {
    // 3. We take the Product ID for the VPC of the Service Catalog from SSM Parameter Store
    const productId = StringParameter.valueForStringParameter(this, `/servicecatalog/${product}/product-id`);
    // 4. We take the Provisioning Artifict ID (Which is the version in the Service Catalog of the VPC)
    const provisioningArtifactId = StringParameter.valueForStringParameter(this, `/servicecatalog/${product}/provisioning-artifact-id`);
    const sc = new ServiceCatalogProduct({ productId, provisioningArtifactId, region: process.env.CDK_DEFAULT_REGION ?? 'eu-west-1' });
    await sc.launchProduct(`${product}`, provisionParameters);
    const resource = await sc.getRessource({ ProvisionedProductName: `${product}` }, provisionParameters[0].Key!);
    return resource[0].OutputValue;
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