# Lambdas

This contains Lambdas for the 4dt-Project.

## Pre-requisite

- Docker
- `docker-compose`
- Node >= 14.x
- pnpm

## Development

The local development is on top of [localstack](https://onexlab-io.medium.com/localstack-dynamodb-8befdaac802b).<br/>
Please, make sure that Docker is activated.
**NOTE: `docker-compose` runs as a daemon and the `-d`- flag is activated.

```bash
# Assuming you are in the lambdas-folder
pnpm dev
```

### Test

```bash
pnpm test # or pnpm test:watch to do TDD
```

### Shutdown

```bash
docker-compose down
```