import { SSMClient, GetParametersCommand } from '@aws-sdk/client-ssm';
import { mockClient } from 'aws-sdk-client-mock';
import { getNetworkingContext } from '../src/utils/getContext';

const ssmClientMock = mockClient(SSMClient);

// eslint-disable-next-line @typescript-eslint/no-require-imports
const callServiceCatalogProduct = require('../src/utils/callServiceCatalog');

describe('getNetworkingContext', () => {
  it.skip('should return the correct context for networking when all parameters in SSM Parameter Store', async () => {
    ssmClientMock.on(GetParametersCommand).resolves({
      Parameters: [{ Name: '/networking/vpc/id', Value: 'vpcId' },
        { Name: '/networking/private-subnet-1/id', Value: 'privateSubnet1' },
        { Name: '/networking/private-subnet-2/id', Value: 'privateSubnet2' }],
    });

    const context = await getNetworkingContext();

    expect(context).toStrictEqual({
      vpcId: 'vpcId',
      privateSubnet1: 'privateSubnet1',
      privateSubnet2: 'privateSubnet2',
    });
  });

  it.only('should start launching product when no parameters in SSM Parameter Store', async () => {
    ssmClientMock.on(GetParametersCommand).resolves({
      InvalidParameters: ['/networking/vpc/id', '/networking/private-subnet-1/id', '/networking/private-subnet-2/id'],
    });

    jest.spyOn(callServiceCatalogProduct, 'callServiceCatalogProduct')
      .mockResolvedValueOnce('vpcId')
      .mockResolvedValueOnce('privateSubnet1')
      .mockResolvedValueOnce('privateSubnet2');

    const context = await getNetworkingContext();
    expect(context).toStrictEqual({
      vpcId: 'vpcId',
      privateSubnet1: 'privateSubnet1',
      privateSubnet2: 'privateSubnet2',
    });
  });

  it.skip('should return vpcID for networking because its in SSM Parameter Store but should launch Private Subnets and return their IDs', async () => {

  });

  // it.skip('should return the networking object consist of vpcId, privateSubnet1, privateSubnet2', async () => {
  //   const params: Parameter[] = [{ Name: 'Foo', Value: 'Bar' }];
  //   const params2: number[] = [0];
  //   await getParams(params);
  //   await getParams(params2);
  // });
});