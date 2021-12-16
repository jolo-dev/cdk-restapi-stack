import express from 'express';
// eslint-disable-next-line import/no-extraneous-dependencies
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const app = express();

app.use(express.static(__dirname + '/openapi'));

const region = process.env.REGION ?? 'eu-west-1';
const stage = process.env.STAGE ?? 'dev';
const restApiId = process.env.API_GW_ID ?? 'localhost';
const vpcEndpointId = process.env.VPC_ENDPOINT_ID ?? '';
const account = process.env.ACCOUNT ?? '';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const definition = require('./openapi/openapi.json');
const serverDefinition = {
  'servers': [{
    'url': `https://${restApiId}-${vpcEndpointId}.execute-api.${region}.amazonaws.com/{basePath}`,
    'variables': {
      basePath: {
        default: stage,
      },
    },
    'x-amazon-apigateway-endpoint-configuration': {
      vpcEndpointIds: ['${vpcEndpointId}'],
    },
  }],
  'x-amazon-apigateway-policy': {
    Version: '2012-10-17',
    Statement: [{
      Sid: 'AllowVPCEndpointToInvoke',
      Effect: 'Allow',
      Principal: {
        AWS: '*',
      },
      Action: 'execute-api:Invoke',
      Resource: `arn:aws:execute-api:${region}:${account}:${restApiId}/*/*/*`,
      Condition: {
        StringEquals: {
          'aws:sourceVpce': '${vpcEndpointId}',
        },
      },
    },
    {
      Sid: 'InvokeLambda',
      Effect: 'Allow',
      Principal: {
        AWS: '*',
      },
      Action: 'lambda:InvokeFunction',
      Resource: 'lambda.amazonaws.com',
    }],
  },
};
const options = {
  definition: {
    ...definition, ...serverDefinition,
  },
  apis: [],
};

const openapi = swaggerJsdoc(options);
app.use('/', swaggerUi.serve, swaggerUi.setup(openapi));
// The serverless-express library creates a server and listens on a Unix
// Domain Socket for you, so you can remove the usual call to app.listen.
app.listen(3000);


export { app };
