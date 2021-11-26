import { SSMClient, GetParametersCommand, GetParametersCommandInput } from '@aws-sdk/client-ssm';

export const getSsmParams = async (input: GetParametersCommandInput) => {
  try {
    const ssmClient = new SSMClient({ region: process.env.CDK_DEFAULT_REGION ?? 'eu-west-1' });
    const command = new GetParametersCommand(input);
    const params = await ssmClient.send(command);
    return params;
  } catch (error) {
    console.error(error);
    throw Error('Error in GetParametersCommand');
  }
};