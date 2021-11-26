import { SSMClient, GetParametersCommand } from '@aws-sdk/client-ssm';
import { mockClient } from 'aws-sdk-client-mock';
import { getNetworkingContext, toCamelCase } from '../src/utils/getContext';

const ssmClientMock = mockClient(SSMClient);

// eslint-disable-next-line @typescript-eslint/no-require-imports
const callServiceCatalogProduct = require('../src/utils/callServiceCatalog');

describe('getNetworkingContext', () => {
  it('should return the correct context for networking when all parameters in SSM Parameter Store', async () => {
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

  it('should start launching product when no parameters in SSM Parameter Store', async () => {
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

  it('should return vpcID for networking because its in SSM Parameter Store but should launch Private Subnets and return their IDs', async () => {
    ssmClientMock.on(GetParametersCommand).resolves({
      Parameters: [{ Name: '/networking/vpc/id', Value: 'vpcId' }],
      InvalidParameters: ['/networking/private-subnet-1/id', '/networking/private-subnet-2/id'],
    });

    jest.spyOn(callServiceCatalogProduct, 'callServiceCatalogProduct')
      .mockResolvedValueOnce('privateSubnet1')
      .mockResolvedValueOnce('privateSubnet2');

    const context = await getNetworkingContext();
    expect(context).toStrictEqual({
      vpcId: 'vpcId',
      privateSubnet1: 'privateSubnet1',
      privateSubnet2: 'privateSubnet2',
    });
  });

  it('should return vpcId with three subnets', async () => {
    ssmClientMock.on(GetParametersCommand).resolves({
      Parameters: [{ Name: '/networking/vpc/id', Value: 'vpcId' }],
      InvalidParameters: ['/networking/private-subnet-1/id', '/networking/private-subnet-2/id', '/networking/private-subnet-3/id'],
    });

    jest.spyOn(callServiceCatalogProduct, 'callServiceCatalogProduct')
      .mockResolvedValueOnce('privateSubnet1')
      .mockResolvedValueOnce('privateSubnet2')
      .mockResolvedValueOnce('privateSubnet3');

    const context = await getNetworkingContext();
    expect(context).toStrictEqual({
      vpcId: 'vpcId',
      privateSubnet1: 'privateSubnet1',
      privateSubnet2: 'privateSubnet2',
      privateSubnet3: 'privateSubnet3',
    });
  });
});

describe('toCamelCase', () => {
  it('should convert camel-case to camelCase ', () => {
    const camelCaseMe = toCamelCase('camel-case');
    expect(camelCaseMe).toEqual('camelCase');
  });

  it('should not camelCase because its already camelCased', () => {
    const camelCaseMe = toCamelCase('camelCase');
    expect(camelCaseMe).toEqual('camelCase');
  });
});