import { callServiceCatalogProduct, ProductValue, PrivateSubnetValue, VpcInputKeyValue } from './callServiceCatalog';
import { getSsmParams } from './getSsmParams';

export const toCamelCase = (str: string) => {
  return str.includes('-') ? str
    .replace(/[^a-z0-9]/gi, '-')
    .toLowerCase()
    .split('-')
    .map((el, ind) => ind === 0 ? el : el[0].toUpperCase() +
el.substring(1, el.length))
    .join('')
    : str;
};

const availabilityZone = ['eu-west-1a', 'eu-west-1b', 'eu-west-1c'];

export const getNetworkingContext = async () => {

  const params = await getSsmParams({ Names: ['/networking/vpc/id', '/networking/private-subnet-1/id', '/networking/private-subnet-2/id'] });
  let validParams = {};
  let vpcId: string = '';
  let countSubnets = 1; // Starting at 1 because the first should have the suffix -1
  if (params.Parameters) {
    for ( const para of params.Parameters ) {
      const product = para.Name!.split('/')[2]; // getting the second word from the path

      const key = product === 'vpc' ? 'vpcId' : toCamelCase(product);
      vpcId = product === 'vpc' && para.Value ? para.Value : '';

      countSubnets = product !== 'vpc' ? ++countSubnets : countSubnets;
      validParams = { ...validParams, [key]: para.Value };
    }
  }

  let invalidParams: any;
  if (params.InvalidParameters) {
    for (const para of params.InvalidParameters) {
      const product = para.split('/')[2];
      const key = product === 'vpc' ? 'vpcId' : toCamelCase(product);
      let value: string = '';
      if (product === 'vpc') {
        vpcId = await callServiceCatalogProduct(ProductValue.VPC, [{ Key: VpcInputKeyValue.APPLICATION_NAME, Value: 'VPCFor4d' }]);
        value = vpcId;
      } else {
        if (vpcId !== '') {
          value = await callServiceCatalogProduct(ProductValue.PRIVATE_SUBNET,
            [{ Key: PrivateSubnetValue.VPC_ID, Value: vpcId },
              { Key: PrivateSubnetValue.AVAILABILITY_ZONE, Value: availabilityZone[(countSubnets - 1) % 3] }],
            countSubnets++);
        }
      }
      invalidParams = { ...invalidParams, [key]: value };
    }
  }

  return { ...validParams, ...invalidParams };
};