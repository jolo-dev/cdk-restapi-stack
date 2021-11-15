# Infrastructure of 4dt

This project uses [`projen`](https://github.com/projen/projen) which is on top of [AWS CDK](https://aws.amazon.com/cdk/) as Infrastructure to Code.

## Prerequisite

- Node v14.x
- Typescript
- [`aws configure sso`](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-sso.html)
- [`sam-beta-cdk`](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-cdk-getting-started.html) for local development

## Structure

This project is scaffolded by using `npx projen new awscdk-app-ts` and is purely in Typescript.
