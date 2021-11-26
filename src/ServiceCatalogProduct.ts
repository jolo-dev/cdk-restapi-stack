import {
  ServiceCatalogClient,
  ProvisionProductCommand,
  ProvisionProductCommandInput,
  ProvisioningParameter,
  GetProvisionedProductOutputsCommand,
  GetProvisionedProductOutputsCommandInput,
} from '@aws-sdk/client-service-catalog';
import { SSMClient, PutParameterCommand, PutParameterCommandInput } from '@aws-sdk/client-ssm';
import { createWaiter, WaiterConfiguration, WaiterState } from '@aws-sdk/util-waiter';


interface ServiceCatalogProductProps{
  productId: string;
  provisioningArtifactId: string;
  region: string;
}

// Making sure at least ProvisionedProductName or ProvisionedProductId is required
type AtLeastOne<T, U = {[K in keyof T]: Pick<T, K> }> = Partial<T> & U[keyof U]
type RessourceInput = AtLeastOne<Required<Pick<GetProvisionedProductOutputsCommandInput, 'ProvisionedProductName' | 'ProvisionedProductId'>>>

export class ServiceCatalogProduct {
  private productId: string;
  private provisioningArtifactId: string;
  private region: string;
  private serviceCatalogClient: ServiceCatalogClient;

  constructor(sc: ServiceCatalogProductProps) {
    this.productId = sc.productId;
    this.provisioningArtifactId = sc.provisioningArtifactId;
    this.region = sc.region;
    this.serviceCatalogClient = new ServiceCatalogClient({ region: this.region });
  }

  public async launchProduct(provisionedProductName: string, provisionParameters: ProvisioningParameter[]) {
    try {
      const input = {
        ProvisionedProductName: provisionedProductName,
        ProductId: this.productId,
        ProvisioningArtifactId: this.provisioningArtifactId,
        ProvisioningParameters: provisionParameters,
      };
      const command = new ProvisionProductCommand(input);
      const response = await this.serviceCatalogClient.send(command);
      await this.waitUntilProductLaunch({ client: this.serviceCatalogClient, maxWaitTime: 600 }, input);
      return response;
    } catch (error) {
      console.error(error);
      throw new Error(`Error in launching product: ${provisionedProductName}`);
    }
  }

  public async getRessource(input: RessourceInput, outputKey: string) {
    try {
      const command = new GetProvisionedProductOutputsCommand(input);
      const response = await this.serviceCatalogClient.send(command);
      const output = response.Outputs;
      if (!output) {
        throw new ReferenceError;
      }
      return output.filter(out => out.OutputKey === outputKey);
    } catch (error) {
      console.error(error);
      const output = input.ProvisionedProductName ?? input.ProvisionedProductId;
      if (error instanceof ReferenceError) {
        throw new ReferenceError(`No Ressource by given input found: ${output}`);
      } else {
        throw new Error(`Error in getting ressource ${output}`);
      }
    }
  }

  public async checkState(client: ServiceCatalogClient, input: ProvisionProductCommandInput) {
    let reason;
    try {
      const result: any = await client.send(new ProvisionProductCommand(input));
      reason = result;
      return { state: WaiterState.SUCCESS, reason };
    } catch (exception) {
      console.log(exception);
    }
    return { state: WaiterState.ABORTED, reason };
  };

  public async waitUntilProductLaunch(
    params: WaiterConfiguration<ServiceCatalogClient>,
    input: ProvisionProductCommandInput,
  ) {
    const result = await createWaiter({ minDelay: 5, maxDelay: 120, ...params }, input, this.checkState);
    return result;
  }

  public async setSSMParameter(input: PutParameterCommandInput) {
    const client = new SSMClient({ region: this.region });
    try {
      const name = input.Name;
      const value = input.Value;

      // Catch if any of these two is undefined
      if (name === undefined || value === undefined) {
        throw new Error('Please define both Name and Value');
      }
      // Catch if the pattern of the name does not follow the convention /my/path/value
      const pathRegex = new RegExp('\/[^\r\n]+');
      if (!pathRegex.test(name)) {
        throw new Error('Input name is not following the convention /my/path/value');
      }
      const command = new PutParameterCommand(input);
      const data = await client.send(command);
      return data;
    } catch (error: unknown) {
      console.error(error);
      const e = error as Error;
      throw new Error(e.message);
    }
  }

}