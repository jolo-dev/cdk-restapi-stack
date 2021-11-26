import { SSMClient, GetParametersCommand } from '@aws-sdk/client-ssm';
import { mockClient } from 'aws-sdk-client-mock';
import { getSsmParams } from '../src/utils/getSsmParams';

const ssmClientMock = mockClient(SSMClient);
describe('getSsmParams', () => {
  it('should get all the requested params', async () => {
    ssmClientMock.on(GetParametersCommand).resolves({
      Parameters: [{ Name: 'TestName1', Value: 'TestValue1' }, { Name: 'TestName2', Value: 'TestValue2' }],
    });

    const stub = await getSsmParams({ Names: ['/foo/bar/baz', '/lorem/ipsum'] });
    expect(stub.Parameters!).not.toBeUndefined();
    expect(stub.Parameters![0].Name).toEqual('TestName1');
    expect(stub.Parameters![0].Value).toEqual('TestValue1');
    expect(stub.Parameters![1].Name).toEqual('TestName2');
    expect(stub.Parameters![1].Value).toEqual('TestValue2');
  });

  it('should throw when error in getSsmParams', async() => {
    ssmClientMock.on(GetParametersCommand).rejects();
    await expect(getSsmParams({ Names: ['/foo/bar/baz', '/lorem/ipsum'] })).rejects.toThrowError('Error in GetParametersCommand');
  });
});