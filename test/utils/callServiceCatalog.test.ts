/* eslint-disable @typescript-eslint/no-require-imports */
import { ServiceCatalogProduct } from '../../infrastructure/stacks/lambda-fleet/ServiceCatalogProduct';
import { callServiceCatalogProduct, ProductValue, VpcInputKeyValue, PrivateSubnetKeyValue } from '../../infrastructure/utils/callServiceCatalog';
const getSsmParams = require('../../infrastructure/utils/getSsmParams');

describe('callServiceCatalog', () => {

  let mockGetSsmParams: jest.SpyInstance;

  ['vpc', 'private-subnet'].forEach(ressource => {

    describe(ressource, () => {

      beforeEach(() => {
        mockGetSsmParams = jest.spyOn(getSsmParams, 'getSsmParams').mockResolvedValue({
          Parameters: [{ Name: `/servicecatalog/${ressource}/product-id`, Value: 'SSMResult' },
            { Name: `/servicecatalog/${ressource}/provisioning-artifact-id`, Value: 'SSMResult' }],
          InvalidParameters: [],
        });
      });

      const product = ressource === 'vpc' ? ProductValue.VPC : ProductValue.PRIVATE_SUBNET;
      const provisionParams = ressource === 'vpc'
        ? [{ Key: VpcInputKeyValue.APPLICATION_NAME, Value: 'Bla' }]
        : [{ Key: PrivateSubnetKeyValue.VPC_ID, Value: 'vpc-1234567' }, { Key: PrivateSubnetKeyValue.AVAILABILITY_ZONE, Value: 'Buxtehude' }];

      it('should call SSM Parameter store, launch product, get the new launched product and return the ID', async () => {
        jest.spyOn(ServiceCatalogProduct.prototype, 'launchProduct')
          .mockResolvedValue({ $metadata: {}, RecordDetail: { ProvisionedProductName: 'foo' } });
        jest.spyOn(ServiceCatalogProduct.prototype, 'getRessource')
          .mockResolvedValue([{ OutputValue: 'ID' }]);
        jest.spyOn(ServiceCatalogProduct.prototype, 'setSSMParameter')
          .mockResolvedValue({ $metadata: {} });

        const provisionProduct = await callServiceCatalogProduct(product, provisionParams);
        expect(mockGetSsmParams).toBeCalledTimes(1);
        expect(provisionProduct).toEqual('ID');

        // Also Test when we set a `count`- value
        const launchedProduct = await callServiceCatalogProduct(product, provisionParams, 1);
        expect(launchedProduct).toEqual('ID');
      });

      it('should throw when getting SSM Parameters are undefined', async () => {
        jest.spyOn(getSsmParams, 'getSsmParams').mockResolvedValue({ Parameters: undefined, InvalidParameters: [] });
        await expect(callServiceCatalogProduct(product, provisionParams))
          .rejects.toThrowError(`Error when fetching Parameters following product: ${ressource}`);
      });

      it('should throw after getting SSM Parameters for `product-id` `Parameter.Value === undefined`', async () => {
        jest.spyOn(getSsmParams, 'getSsmParams').mockResolvedValue({
          Parameters: [{ Name: `/servicecatalog/${ressource}/product-id`, Value: undefined }],
          InvalidParameters: [],
        });
        await expect(callServiceCatalogProduct(product, provisionParams))
          .rejects.toThrowError(`Error when retrieving value for /servicecatalog/${ressource}/product-id`);
      });

      it('should throw after getting SSM Parameters for `provisioning-artifact-id` `Parameter.Value === undefined`', async () => {
        jest.spyOn(getSsmParams, 'getSsmParams').mockResolvedValue({
          Parameters: [
            { Name: `/servicecatalog/${ressource}/provisioning-artifact-id`, Value: undefined },
            { Name: `/servicecatalog/${ressource}/product-id`, Value: 'foo' },
          ],
          InvalidParameters: [],
        });
        await expect(callServiceCatalogProduct(product, provisionParams))
          .rejects.toThrowError(`Error when retrieving value for /servicecatalog/${ressource}/provisioning-artifact-id`);
      });

      it('should throw after getting SSM Parameters for `product-id` when `Parameter.Value && Parameter.Name === undefined`', async () => {
        jest.spyOn(getSsmParams, 'getSsmParams').mockResolvedValue({
          Parameters: [
            { Name: undefined, Value: undefined },
          ],
          InvalidParameters: [],
        });
        await expect(callServiceCatalogProduct(product, provisionParams))
          .rejects.toThrowError("Cannot read properties of undefined (reading 'Value')");
      });

      it('should throw after getting SSM Parameters for `provisioning-artifact-id` when `Parameter.Value && Parameter.Name === undefined`', async () => {
        jest.spyOn(getSsmParams, 'getSsmParams').mockResolvedValue({
          Parameters: [
            { Name: undefined, Value: undefined },
            { Name: `/servicecatalog/${ressource}/product-id`, Value: 'foo' },
          ],
          InvalidParameters: [],
        });
        await expect(callServiceCatalogProduct(product, provisionParams))
          .rejects.toThrowError("Cannot read properties of undefined (reading 'Value')");
      });

      it('should throw when something wrong with the ProvisionedProductName', async () => {
        jest.spyOn(ServiceCatalogProduct.prototype, 'launchProduct')
          .mockResolvedValue({ $metadata: {}, RecordDetail: { ProvisionedProductName: undefined } });

        await expect(callServiceCatalogProduct(product, provisionParams)).rejects.toThrowError(`Error couldnt provision product ${ressource}`);
      });

      it('should throw when launching product and the `RecordDetail === undefined`', async () => {
        jest.spyOn(ServiceCatalogProduct.prototype, 'launchProduct')
          .mockResolvedValue({ $metadata: {}, RecordDetail: undefined });

        await expect(callServiceCatalogProduct(product, provisionParams)).rejects.toThrowError(`Error couldnt provision product ${ressource}`);
      });

      it('should throw when `OutputValue === undefined`', async () => {
        jest.spyOn(ServiceCatalogProduct.prototype, 'launchProduct')
          .mockResolvedValue({ $metadata: {}, RecordDetail: { ProvisionedProductName: 'foo' } });
        jest.spyOn(ServiceCatalogProduct.prototype, 'getRessource')
          .mockResolvedValue([{ OutputValue: undefined }]);

        await expect(callServiceCatalogProduct(product, provisionParams))
          .rejects.toThrowError(`Error because getting ressource for ${ressource}. Output value is undefined`);
      });

      it('should throw when region is set wrongly', async () => {
        process.env.CDK_DEFAULT_REGION = 'foo';
        await expect(callServiceCatalogProduct(product, provisionParams)).rejects.toThrow();
      });

      afterEach(() => {
        mockGetSsmParams.mockRestore();
      });

    });
  });

});