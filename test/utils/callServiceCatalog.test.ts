/* eslint-disable @typescript-eslint/no-require-imports */
import { ServiceCatalogProduct } from '../../src/stacks/lambda-fleet/ServiceCatalogProduct';
import { callServiceCatalogProduct, ProductValue, VpcInputKeyValue, VPCInputParams } from '../../src/utils/callServiceCatalog';
const getSsmParams = require('../../src/utils/getSsmParams');

describe('callServiceCatalog', () => {

  let mockGetSsmParams: jest.SpyInstance;
  const vpcProduct = ProductValue.VPC;
  const vpcProvisionParams: VPCInputParams[] = [{ Key: VpcInputKeyValue.APPLICATION_NAME, Value: 'Bla' }];
  beforeEach(() => {
    mockGetSsmParams = jest.spyOn(getSsmParams, 'getSsmParams').mockResolvedValue({
      Parameters: [{ Name: '/servicecatalog/vpc/product-id', Value: 'SSMResult' },
        { Name: '/servicecatalog/vpc/provisioning-artifact-id', Value: 'SSMResult' }],
      InvalidParameters: [],
    });
  });

  it('should call SSM Parameter store, launch product, get the new launched product and return the ID', async () => {
    jest.spyOn(ServiceCatalogProduct.prototype, 'launchProduct')
      .mockResolvedValue({ $metadata: {}, RecordDetail: { ProvisionedProductName: 'foo' } });
    jest.spyOn(ServiceCatalogProduct.prototype, 'getRessource')
      .mockResolvedValue([{ OutputValue: 'ID' }]);
    jest.spyOn(ServiceCatalogProduct.prototype, 'setSSMParameter')
      .mockResolvedValue({ $metadata: {} });

    const provisionProduct = await callServiceCatalogProduct(vpcProduct, vpcProvisionParams);
    expect(mockGetSsmParams).toBeCalledTimes(1);
    expect(provisionProduct).toEqual('ID');
  });

  it('should throw when getting SSM Parameters are undefined', async () => {
    jest.spyOn(getSsmParams, 'getSsmParams').mockResolvedValue({ Parameters: undefined, InvalidParameters: [] });
    await expect(callServiceCatalogProduct(vpcProduct, vpcProvisionParams))
      .rejects.toThrowError('Error when fetching Parameters following product: vpc');
  });

  it('should throw after getting SSM Parameters for `product-id` `Parameter.Value === undefined`', async () => {
    jest.spyOn(getSsmParams, 'getSsmParams').mockResolvedValue({ Parameters: [{ Name: '/servicecatalog/vpc/product-id', Value: undefined }], InvalidParameters: [] });
    await expect(callServiceCatalogProduct(vpcProduct, vpcProvisionParams))
      .rejects.toThrowError('Error when retrieving value for /servicecatalog/vpc/product-id');
  });

  it('should throw after getting SSM Parameters for `provisioning-artifact-id` `Parameter.Value === undefined`', async () => {
    jest.spyOn(getSsmParams, 'getSsmParams').mockResolvedValue({
      Parameters: [
        { Name: '/servicecatalog/vpc/provisioning-artifact-id', Value: undefined },
        { Name: '/servicecatalog/vpc/product-id', Value: 'foo' },
      ],
      InvalidParameters: [],
    });
    await expect(callServiceCatalogProduct(vpcProduct, vpcProvisionParams))
      .rejects.toThrowError('Error when retrieving value for /servicecatalog/vpc/provisioning-artifact-id');
  });

  it('should throw after getting SSM Parameters `Parameter.Value === undefined`', async () => {
    jest.spyOn(getSsmParams, 'getSsmParams').mockResolvedValue({ Parameters: [{ Name: 'foo/bar/baz', Value: undefined }], InvalidParameters: [] });
    await expect(callServiceCatalogProduct(vpcProduct, vpcProvisionParams)).rejects.toThrowError('Error when retrieving value for foo/bar/baz');
  });

  it('should throw when something wrong with the ProvisionedProductName', async () => {
    jest.spyOn(ServiceCatalogProduct.prototype, 'launchProduct')
      .mockResolvedValue({ $metadata: {}, RecordDetail: { ProvisionedProductName: undefined } });

    await expect(callServiceCatalogProduct(vpcProduct, vpcProvisionParams)).rejects.toThrowError('Error couldnt provision product vpc');
  });

  it('should throw when for vpc `OutputValue === undefined`', async () => {
    jest.spyOn(ServiceCatalogProduct.prototype, 'launchProduct')
      .mockResolvedValue({ $metadata: {}, RecordDetail: { ProvisionedProductName: 'foo' } });
    jest.spyOn(ServiceCatalogProduct.prototype, 'getRessource')
      .mockResolvedValue([{ OutputValue: undefined }]);

    await expect(callServiceCatalogProduct(vpcProduct, vpcProvisionParams))
      .rejects.toThrowError('Error because getting ressource for vpc. Output value is undefined');
  });

  it('should throw when for subnet `OutputValue === undefined`', async () => {
    jest.spyOn(ServiceCatalogProduct.prototype, 'launchProduct')
      .mockResolvedValue({ $metadata: {}, RecordDetail: { ProvisionedProductName: 'foo' } });
    jest.spyOn(ServiceCatalogProduct.prototype, 'getRessource')
      .mockResolvedValue([{ OutputValue: undefined }]);

    await expect(callServiceCatalogProduct(vpcProduct, vpcProvisionParams))
      .rejects.toThrowError('Error because getting ressource for vpc. Output value is undefined');
  });

  afterEach(() => {
    mockGetSsmParams.mockRestore();
  });
});