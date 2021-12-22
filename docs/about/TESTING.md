# Testing

This section is about the different ways to test this project.
All tests are covered with `jest`.

## Unit tests

Unit test is crucial to test each function.
To run all unit tests.

```bash
pnpm test
```

## Integration tests

Whereas the unit test stub and mock AWS Services, an integration test can give better understanding if the function works when integrated on AWS.
The integration tests are marked as `Integration Test` and `skipped` during `pnpm test`.
These can be manually enabled by simply removing `skip` within the test.

This project contains Integration tests for the infrastructure and a local for the Lambdas

**Note: You can not run all integration tests at once because you need to have "real" AWS activated for infrastructure test and a "mocked" Account for Localstack**

### Local integration test

The local integration requires you to have [`docker-compose`](LOCALDEVELOPMENT.md#docker-compose-yml) activated because it will run against Localstack.

**Note: Don't have your "real" AWS Account activated.**

```bash
# Integration test is in the lambdas directory
cd lambdas
pnpm test:integration
```

Or if `docker-compose` is already running in the background

```bash
npx jest -- lambdas/test/local.integration.test.ts
```

**REMEMBER: To set the `skip` after each `test` in the integration test otherwise it will be considered in the unit test**
