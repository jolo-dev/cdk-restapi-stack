import { ServiceCatalogClient, ProvisionProductCommand, GetProvisionedProductOutputsCommand } from '@aws-sdk/client-service-catalog';
import { SSMClient, PutParameterCommand } from '@aws-sdk/client-ssm';
import { WaiterState } from '@aws-sdk/util-waiter';
import { mockClient } from 'aws-sdk-client-mock';
import { ServiceCatalogProduct } from '../../src/stacks/lambda-fleet/ServiceCatalogProduct';

const scMock = mockClient(ServiceCatalogClient);
const scProduct = new ServiceCatalogProduct({ productId: 'testProductId', provisioningArtifactId: 'testArtifactId', region: 'region' });
const ssmMock = mockClient(SSMClient);
describe('ServiceCatalog', () => {
  beforeEach(() => {
    scMock.reset();
  });

  it('should launch a product', async () => {
    scMock.on(ProvisionProductCommand).resolves({ RecordDetail: { PathId: '123', ProductId: '456', ProvisioningArtifactId: '789' } });
    const product = await scProduct.launchProduct('foo', [{ Key: 'bar', Value: 'baz' }]);
    expect(product.RecordDetail!.PathId).toBe('123');
    expect(product.RecordDetail!.ProductId).toBe('456');
    expect(product.RecordDetail!.ProvisioningArtifactId).toBe('789');
  });

  it('should throw when error in launching a product', async () => {
    scMock.on(ProvisionProductCommand).rejects();
    await expect(scProduct.launchProduct('foo', [{ Key: 'bar', Value: 'baz' }])).rejects.toThrowError('Error in launching product: foo');
  });

  it('should get resource by ProvisionedProductName', async () => {
    scMock.on(GetProvisionedProductOutputsCommand).resolves({
      Outputs: [{ OutputKey: 'TestOutputKey', OutputValue: 'TestOutputValue' }],
    });
    const ressource = await scProduct.getRessource({ ProvisionedProductName: 'bar' }, 'TestOutputKey');
    expect(ressource![0].OutputValue).toEqual('TestOutputValue');
  });

  it('should get resource by ProvisionedProductId', async () => {
    scMock.on(GetProvisionedProductOutputsCommand).resolves({
      Outputs: [{ OutputKey: 'TestOutputIdKey', OutputValue: 'TestOutputIdValue' }],
    });
    const ressource = await scProduct.getRessource({ ProvisionedProductId: '123' }, 'TestOutputIdKey');
    expect(ressource![0].OutputValue).toEqual('TestOutputIdValue');
  });

  it('should throw when getting ressource', async () => {
    scMock.on(GetProvisionedProductOutputsCommand).rejects();
    await expect(scProduct.getRessource({ ProvisionedProductName: 'fail' }, '')).rejects.toThrowError('Error in getting ressource fail');
  });

  it('should throw when getting ressource did not find anything by given ProvisionedProductName', async () => {
    scMock.on(GetProvisionedProductOutputsCommand).resolves({});
    await expect(scProduct.getRessource({ ProvisionedProductName: 'foo' }, 'bar')).rejects.toThrow('No Ressource by given input found: foo');
  });

  it('should throw when getting ressource did not find anything by given ProvisionedProductId', async () => {
    scMock.on(GetProvisionedProductOutputsCommand).resolves({});
    await expect(scProduct.getRessource({ ProvisionedProductId: '123' }, 'bar')).rejects.toThrow('No Ressource by given input found: 123');
  });

  it('should set a parameter', async () => {
    ssmMock.on(PutParameterCommand).resolves({
      Version: 1,
    });
    const foo = await scProduct.setSSMParameter({ Name: '/foo/bar/baz', Value: 'Test' });
    expect(foo!.Version!).toEqual(1);
  });

  it('should throw because name of parameter does not follow the convention', async () => {
    ssmMock.on(PutParameterCommand).resolves({});
    await expect(scProduct.setSSMParameter({ Name: 'fooBarBaz', Value: 'Test' })).rejects.toThrowError('Input name is not following the convention /my/path/value');
  });

  it('should throw because name is not undefined', async () => {
    ssmMock.on(PutParameterCommand).resolves({});
    await expect(scProduct.setSSMParameter({ Name: undefined, Value: 'Test' })).rejects.toThrowError('Please define both Name and Value');
  });

  it('should throw because value is not undefined', async () => {
    ssmMock.on(PutParameterCommand).resolves({});
    await expect(scProduct.setSSMParameter({ Name: '/foo/bar/baz', Value: undefined })).rejects.toThrowError('Please define both Name and Value');
  });

  it('should check state', async () => {
    scMock.on(ProvisionProductCommand).resolves({});
    const sc = new ServiceCatalogClient({ region: 'hamburg' });
    const result = await scProduct.checkState(sc, { ProvisionedProductName: '' });
    expect(result).toEqual({ state: WaiterState.SUCCESS, reason: {} });
  });

  it('should abort state', async () => {
    scMock.on(ProvisionProductCommand).rejects({ message: 'Service is down' });
    const sc = new ServiceCatalogClient({ region: 'hamburg' });
    const result = await scProduct.checkState(sc, { ProvisionedProductName: '' });
    expect(result).toEqual({ state: WaiterState.ABORTED, reason: 'Service is down' });
  });
});


