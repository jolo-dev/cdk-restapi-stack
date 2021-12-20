# Lambdas

This contains Lambdas for the 4dt-Project.

## Pre-requisite

- Docker
- `docker-compose`
- Node >= 14.x
- pnpm

Open a new Terminal session where you didn't export `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, and `AWS_SESSION_TOKEN`.

## Development

The local development is on top of [localstack](https://onexlab-io.medium.com/localstack-dynamodb-8befdaac802b).<br/>
Please, make sure that Docker is activated.
**NOTE: `docker-compose` runs as a daemon and the `-d`- flag is activated.**

```bash
# Assuming you are in the lambdas-folder
pnpm dev
```

### Test

```bash
pnpm test # or pnpm test:watch to do TDD
```

### Test-Driven-Development (TDD)

```bash
pnpm test:watch
```

### Integration Test (Local)

```bash
pnpm test:integration
```

### Shutdown docker-compose

The `docker-compose` runs in the background and sometimes needs to be shutdown.

```bash
docker-compose down
```

## Troubleshooting

Check the [Troubleshooting](../docs/about/TROUBLESHOOTING.md#local-development).
