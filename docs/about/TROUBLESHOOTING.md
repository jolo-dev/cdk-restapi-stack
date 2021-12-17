# Troubleshooting

## Context is wrong

If you cannot use `pnpm synth` or you get an Error `[Error at /FourD-LambdaFleetStack] Could not find any VPCs matching`, it might that you need to delete `cdk.context.json` and then run `pnpm synth` again.

Here we will create a new `cdk.context.json` and set new contexts.

## Parameter Store has wrong values

The context could also be corrupt because the values from the [SSM Parameter Store](https://eu-west-1.console.aws.amazon.com/systems-manager/parameters/?region=eu-west-1&tab=Table) might be false.

Please verify that `/networking/vpc/id`, `/networking/private-subnet-1/id`, and `/networking/private-subnet-2/id` are set correctly. Double check either from the Service Catalog or Cloudformation or run the command below to see the output value of the `OutputKey: VpcId` (assuming your SSO-profile name is `adidas` and AWS-Cli is installed)

For VPC:

`aws servicecatalog get-provisioned-product-outputs --provisioned-product-name vpc --profile adidas --region eu-west-1`

For Private-Subnet-1:

`aws servicecatalog get-provisioned-product-outputs --provisioned-product-name private-subnet-1 --profile adidas --region eu-west-1`

For Private-Subnet-2:

`aws servicecatalog get-provisioned-product-outputs --provisioned-product-name private-subnet-2 --profile adidas --region eu-west-1`

## Singular vs Plural (Unique Lambda Names)

Each Lambda should be unique and thus its naming.
Verify that Lambdas in the `get`- Folder have different names than in the `post`, or `put`- folder.

## Bundling was stucked

It could happen that you bundled a code which got stucked.
Simply delete `lambdas/dist`- Folder because it will get rebundled again.

## Too many assets/CFN

In order to have a clean development environment, it might be good to delete `cdk.out` which has old synthesized CFN.

## S3 already exists

Make sure an S3 with its name within account and region does not exists yet.
If necessary, delete that Bucket if you want to keep the name.