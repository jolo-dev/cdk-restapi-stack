# Local Development

Everything should be setup for a local development (`infrastructure`, `lambdas`, `docs`).<br/>
Please find in each package its `README.md` for further instructions but also in the `package.json` within the `scripts`- object available scripts.

## Lambdas

This is the heart of the project. Lambda development is using [`Localstack`](https://localstack.cloud/) to deploy against it.
As a prerequisite, you should have [`docker-compose`](https://docs.docker.com/compose/install/) installed.

```bash
cd lambdas && pnpm dev
```

### `docker-compose.yml`

In Localstack, you can define individual services. We are using [its community edition](https://localstack.cloud/features/) with API Gateway, S3, AWS Lambda, IAM, Cloudformation, and DynamoDB ([#2]).

Localstack is also used to perform integration tests locally.

When running `pnpm dev`, `docker-compose` will run in the background as daemon (`-d`- flag is activated [#3]). Of course, you could also start by yourself `docker-compose up` which also allows to see its logs. Otherwise, you could see logs by running:

```bash
docker-compose logs
```

### Watch Mode

It uses a self implemented watch-mode by using [`esbuild`](https://esbuild.github.io/) which has a [`watch`-API](https://esbuild.github.io/api/#watch) ([#4]) in order to perform automated local deployments to Localstack ([#5]).
When `docker-compose` is running in the background, simply run:

```bash
pnpm watch
```

### cdklocal

[`cdklocal`](https://github.com/localstack/aws-cdk-local) is a thin wrapper of [`cdk`-cli](https://docs.aws.amazon.com/cdk/v2/guide/cli.html) for Localstack. 
Currently, only `bootstrap` and `deploy` works ([#6]).
Note: It only works when Localstack is running.

Due to that there is a custom CDK-class `LocalStack.ts`. Because the `LambdaFleet.ts` contains VPCs and VPC Endoints but here we want to keep it simple (see [#7]). It also reuses the `DynamoDbStack` from the `infrastructure`- folder ([#8]).

### Start development

All the commands above a put into `pnpm dev` ([#9]) which [`docker-compose`](#docker-compose), `bootstrap`, and `deploy` and [`watch`](#watch-mode). <br/>
It could happen that the following command get stucked. If so it is most likely that `docker-compose` is still running. <br/>

```bash
# if you want to be super safe
docker-compose down
pnpm dev
```

The local OpenApi/Swagger Documentation is `http://localhost:4566/restapis/<api-gw-id>/local/_user_request_/openapi/index.html` (Note: The rest api changes everytime you restart `docker-compose up`).

![pnpm dev](../../.tours/swagger-docs.png)

## Tools

A useful tool could be [NoSQL Workbench for Amazon DynamoDB](https://aws.amazon.com/dynamodb/nosql-workbench/).
