import { ProvisioningParameter } from '@aws-sdk/client-service-catalog';
import { ServiceCatalogProduct } from '../stacks/lambda-fleet/ServiceCatalogProduct';
import { getSsmParams } from './getSsmParams';

export enum ProductValue {
  VPC = 'vpc',
  PRIVATE_SUBNET = 'private-subnet'
}

export enum VpcInputKeyValue {
  APPLICATION_NAME = 'ApplicationName',
  CIDR_BLOCK = 'CIDRBlock',
  ASSOCIATED_WITH = 'AssociatedWith',
  VPC_FLOWLOGS = 'VPCFlowLogs'
}

export type VPCInputParams = {
  Key: VpcInputKeyValue;
  Value: string | number;
}

export enum PrivateSubnetKeyValue {
  VPC_ID = 'VPCId',
  AVAILABILITY_ZONE = 'AvailabilityZone'
}

export type PrivateSubnetParams = {
  Key: PrivateSubnetKeyValue;
  Value: string | number;
}

type ProvisionParameters<T extends ProductValue.VPC | ProductValue.PRIVATE_SUBNET> =
T extends ProductValue.VPC ? VPCInputParams[] : PrivateSubnetParams[]

/**
 * Utility Function which orchestrates provisioning and launching products from the Service Catalog
 * After it launches the product it returns the ID of the VPC or Subnet
 * @param product Either VPC or Private Subnet look @ ProductValue
 * @param provisionParameters Parameters for the product e.g. VPC ID, AZs or CIDR Block. You could retrive via CLI aws servicecatalog describe-provisioning-parameters --product-id <product-id> --provisioning-artifact-id <provisioning-artifact-id>
 * @param count Optional for naming the Subnets by suffix e.g. private-subnet-1 or private-subnet-2
 * @returns ID of VPC or Subnet
 */
export const callServiceCatalogProduct =
async <T extends ProductValue.VPC | ProductValue.PRIVATE_SUBNET>
(product: T, provisionParameters: ProvisionParameters<T>, count?: number): Promise<string> => {
  try {
    const getServiceCatalogParams = await getSsmParams(
      { Names: [`/servicecatalog/${product}/product-id`, `/servicecatalog/${product}/provisioning-artifact-id`] },
    );

    if (!getServiceCatalogParams.InvalidParameters || getServiceCatalogParams.Parameters === undefined) {
      throw new Error(`Error when fetching Parameters following product: ${product}`);
    }

    const productId = getServiceCatalogParams.Parameters.filter(value => {
      if (!value.Value && value.Name?.includes('product-id')) throw new Error(`Error when retrieving value for ${value.Name}`);
      return value.Name === `/servicecatalog/${product}/product-id`;
    })[0].Value!;

    const provisioningArtifactId = getServiceCatalogParams.Parameters.filter(value => {
      if (!value.Value && value.Name?.includes('provisioning-artifact-id')) throw new Error(`Error when retrieving value for ${value.Name}`);
      return value.Name === `/servicecatalog/${product}/provisioning-artifact-id`;
    })[0].Value!;

    const sc = new ServiceCatalogProduct({ productId, provisioningArtifactId, region: process.env.CDK_DEFAULT_REGION ?? 'eu-west-1' });
    const launchedProduct = await sc.launchProduct(`${product}${count ? '-' + count : ''}`, provisionParameters as ProvisioningParameter[]);

    const ProvisionedProductName = launchedProduct.RecordDetail?.ProvisionedProductName;
    if (!ProvisionedProductName) throw new Error(`Error couldnt provision product ${product}`);

    const resource = await sc.getRessource({ ProvisionedProductName }, product === 'vpc' ? 'VpcId' : 'SubnetId');
    const outputValue = resource[0].OutputValue;

    if (outputValue) {
      await sc.setSSMParameter({ Name: `/networking/${product}/id`, Value: outputValue, Overwrite: true, Type: 'String' });
      return outputValue;
    }
    throw new Error(`Error because getting ressource for ${product}. Output value is undefined`);
  } catch (error) {
    console.error(error);
    const e = error as Error;
    throw new Error(e.message);
  }
};