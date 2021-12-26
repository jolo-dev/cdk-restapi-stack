# Documentation

This package contains besides the OpenApi (Swagger) also the documentation about this project.

## OpenApi

The Lambdas are marked with an `@swagger` (it can also be `@openapi`) notation.
That is needed to create an `openapi.json` which is parsed by using the [`swagger-jsdoc`- library](https://github.com/Surnet/swagger-jsdoc/).<br/>
The construct `infrastructure/stacks/lambda-fleet/OpenApiDocumentation.ts` scrapes all the files which has as a marker `@swagger` in the `lambdas` and `models`- directories.<br/>

### Models
