# Documentation

This package contains besides the OpenApi (Swagger) also the documentation about this project (see `about`- folder).

## OpenApi

The Lambdas are marked with an `@swagger` (it can also be `@openapi`) YAMLnotation.
That is needed to synthesize it into a JSON (`openapi.json`) which is parsed by using the [`swagger-jsdoc`- library](https://github.com/Surnet/swagger-jsdoc/).<br/>
The construct `infrastructure/stacks/lambda-fleet/OpenApiDocumentation.ts` scrapes all the files which has as a marker `@swagger` in the `lambdas` and `models`- directories.

### Lambda Swagger/OpenAPI Express

The Swagger/OpenAPI documentation is deployed via a lambda function. Its code is withing the docs- folder and is a simple ExpressJS app using [`serverless-express`](https://github.com/vendia/serverless-express/) (see `lambdas/stacks/lambda-fleet/OpenApiDocumentation.ts`). It has the resource `/openapi` of the API Gateway.

The Express-App uses [`swagger-ui-express`](https://github.com/scottie1984/swagger-ui-express) as a helper for serving the documenation.

### Bundling

Before each deployment (local or to AWS), it builds a `docs.js`. This should be the only JS-file in this (Mono)-Repo and shall also not be touched.

## Define OpenAPI Specification

Each file which has the OpenAPI Specification is marked with the JSDoc-Annotation `@swagger`. Models should contain the [data schema and the requested body](#models) and the [resource](#resource) the definition of the endpoint.

### Models

A model is a class which represent a data object stored in the DynamoDB. The class is extending from the abstract class `Standard.ts` and implements its abstract class `getProps()`.<br/>
Each class can define its own properties (`props`) and it is recommended to extends the `Standardattributes`- interface.<br/>
The models are openapi-compliant documented (see `@swagger`) and consists `requestBodies` and `schemas`.

### `requestBodies`

`requestBodies` is part of `components` and describes how a this class should be requested.
Below an example of `Season`- class:

```ts
/**
 * @swagger
 * components:
 *   requestBodies:
 *     Season_data:
 *       description: Request to add a new Season.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 */
```

### `schemas`

`schemas` is part of `components` and describes the data schema of the class. This definition should be reflected to its interface.
Below is an example of `Season`- class

```ts
/**
 * @swagger
 * components:
 *   schemas:
 *     Season:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         creationDateTime:
 *           type: string
 */
```

### Resource

Let's say you have a POST-request. So you created a lambda in the `lambdas/src/post/`- folder. The first line should have the same name as the file which represents your endpoint.
The second line is the HTTP-request and the next line the list of tags where it belongs to.<br/>
The fifth line is the `requestBody` which should be referenced (`$ref`) to the `requestBodies` of the [model class](#requestbodies).
The last lines define the responses your lambdas may return.<br/>
See an example for a POST-Request below:

```ts
/* /phase:
 *   post:
 *     tags:
 *       - Phases
 *     requestBody:
 *       $ref: "#/components/requestBodies/Phase_data"
 *     responses:
 *       "201":
 *         description: "Phase has been added successfully"
 *       "400":
 *         description: "Error in adding a new phase"
 *       "406":
 *         description: "The post body is empty or corrupt"
 */ 
```
