import { CfnDocumentationPart, CfnDocumentationPartProps } from '@aws-cdk/aws-apigateway';
import { Construct } from '@aws-cdk/core';

type DocumentationProps = Omit<CfnDocumentationPartProps, 'location' | 'properties'> & {
  method: string;
  lambdaName: string;
  restApiId: string;
}

export class DocumentationPart extends Construct {
  constructor(scope: Construct, id: string, props: DocumentationProps) {
    super(scope, id);
    new CfnDocumentationPart(scope, `${props.method}${props.lambdaName}ResourceDoc`, {
      location: {
        path: `/${props.lambdaName}`,
        type: 'RESOURCE',
      },
      properties: `{\"description\": \"Ressource: ${props.lambdaName}\"}`,
      restApiId: props.restApiId,
    });

    new CfnDocumentationPart(scope, `${props.method}${props.lambdaName}MethodDoc`, {
      location: {
        method: props.method,
        path: `/${props.lambdaName}`,
        type: 'METHOD',
      },
      properties: props.method === 'post'
        ? `{\"description\": \"${props.method.toUpperCase()}-Method for adding ${props.lambdaName}\"}`
        : `{\"description\": \"${props.method.toUpperCase()}-Method for Getting a list of ${props.lambdaName}s\"}`,
      restApiId: props.restApiId,
    });

    new CfnDocumentationPart(scope, `${props.method}${props.lambdaName}ResponseBodySuccessDoc`, {
      location: {
        method: props.method,
        path: `/${props.lambdaName}`,
        type: 'RESPONSE_BODY',
        statusCode: '200',
      },
      properties: props.method === 'post'
        ? `{\"description\": \"${props.lambdaName} has been successfully added\"}`
        : '{\"description\": \"success\"}',
      restApiId: props.restApiId,
    });

    new CfnDocumentationPart(scope, `${props.method}${props.lambdaName}ResponseSuccessDoc`, {
      location: {
        method: props.method,
        path: `/${props.lambdaName}`,
        type: 'RESPONSE',
        statusCode: '200',
      },
      properties: props.method === 'post'
        ? `{\"description\": \"Status code when ${props.lambdaName} had been successfully added\"}`
        : `{\"description\": \"Status code when Getting a list of ${props.lambdaName}s successfully\"}`,
      restApiId: props.restApiId,
    });

    new CfnDocumentationPart(scope, `${props.method}${props.lambdaName}ResponseBodyFailedDoc`, {
      location: {
        method: props.method,
        path: `/${props.lambdaName}`,
        type: 'RESPONSE_BODY',
        statusCode: '400',
      },
      properties: props.method === 'post'
        ? '{\"description\": \"The post body is empty or corrupt\"}'
        : `{\"description\": \"Error in Getting ${props.lambdaName}\"}`,
      restApiId: props.restApiId,
    });

    new CfnDocumentationPart(scope, `${props.method}${props.lambdaName}ResponseFailedDoc`, {
      location: {
        method: props.method,
        path: `/${props.lambdaName}`,
        type: 'RESPONSE',
        statusCode: '400',
      },
      properties: props.method === 'post'
        ? `{\"description\": \"Status code when ${props.lambdaName} was not successfully added\"}`
        : `{\"description\": \"Status code when Getting a list of ${props.lambdaName}s has failed\"}`,
      restApiId: props.restApiId,
    });
  }
}