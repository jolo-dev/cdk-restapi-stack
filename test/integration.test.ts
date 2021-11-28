import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm';
import { ServiceCatalogProduct } from '../src/stacks/lambda-fleet/ServiceCatalogProduct';
import { callServiceCatalogProduct, PrivateSubnetKeyValue, ProductValue } from '../src/utils/callServiceCatalog';
describe('integration', () => {
  const region = 'eu-west-1';
  const ssmClient = new SSMClient({ region });
  const getProductIdParamCommand = new GetParameterCommand({ Name: '/servicecatalog/private-subnet/product-id' });
  const getProvisioningArtifactIdParamCommand = new GetParameterCommand({ Name: '/servicecatalog/private-subnet/provisioning-artifact-id' });
  const getVpcIdParamCommand = new GetParameterCommand({ Name: '/networking/vpc/id' });

  it.skip('should launch a private subnet in the service catalog', async () => {
    /************ Getting values from Parameter Store **************/
    const resultProduct = await ssmClient.send(getProductIdParamCommand);
    const productId = resultProduct.Parameter!.Value!;

    const resultProvision = await ssmClient.send(getProvisioningArtifactIdParamCommand);
    const provisioningArtifactId = resultProvision.Parameter!.Value!;

    const resultVpc = await ssmClient.send(getVpcIdParamCommand);
    const vpcId = resultVpc.Parameter!.Value!;
    /***************************************************************/
    const sc = new ServiceCatalogProduct({ productId, provisioningArtifactId, region });
    const privateSubnet = await sc.launchProduct('private-subnet-2', [{ Key: 'VPCId', Value: vpcId }, { Key: 'AvailabilityZone', Value: 'eu-west-1b' }]);
    expect(privateSubnet.RecordDetail!.ProductId).not.toBeUndefined();
  });

  it.skip('should get the private subnet which has been launched above and set the value to the SSM Parameter Store', async () => {
    const product = 'private-subnet-2';
    const resultProduct = await ssmClient.send(getProductIdParamCommand);
    const productId = resultProduct.Parameter!.Value!;

    const resultProvision = await ssmClient.send(getProvisioningArtifactIdParamCommand);
    const provisioningArtifactId = resultProvision.Parameter!.Value!;
    const sc = new ServiceCatalogProduct({ productId, provisioningArtifactId, region });

    const resource = await sc.getRessource({ ProvisionedProductName: product }, 'SubnetId');
    const outputValue = resource[0].OutputValue;

    expect(outputValue).not.toBeUndefined();
    expect(outputValue).not.toBe('');
    expect(outputValue).not.toBeNull();

    await sc.setSSMParameter({ Name: `/networking/${product}/id`, Value: outputValue, Overwrite: true, Type: 'String' });

    // Now checking if set
    const ssmCheckResult = await ssmClient.send(new GetParameterCommand({ Name: `/networking/${product}/id` }));
    const ssmCheck = ssmCheckResult.Parameter!.Value!;

    expect(ssmCheck).not.toBeUndefined();
    expect(ssmCheck).not.toBe('');
    expect(ssmCheck).not.toBeNull();
  });


  it.skip('get all the parameters', async () => {
    const product = await callServiceCatalogProduct(ProductValue.PRIVATE_SUBNET, [{ Key: PrivateSubnetKeyValue.VPC_ID, Value: 'bla' }, { Key: PrivateSubnetKeyValue.VPC_ID, Value: 'asd' }]);
    expect(product).not.toBeUndefined();
    expect(product).not.toBe('');
    expect(product).not.toBeNull();
  });
});