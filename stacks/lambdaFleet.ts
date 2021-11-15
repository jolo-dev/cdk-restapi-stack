import { Stack, Construct, StackProps } from '@aws-cdk/core';
import { Code, Function, Runtime, Tracing } from '@aws-cdk/aws-lambda';
import fs from 'fs'
import path from 'path'

export class LambdaFleetStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps){
        super(scope, id, props);

        const buildPath = '../lambdas/build'
        const lambdas = fs.readdirSync(path.dirname(buildPath))
        lambdas.forEach(lambda => {
            const lambdaName = lambda.replace('.js', '')
            new Function(this, `${lambdaName}Function`, {
                runtime: Runtime.NODEJS_14_X,
                handler: 'app.handler',
                code: Code.fromAsset(`buildPath/${lambda}`),
                tracing: Tracing.ACTIVE,
              })
        })
    }
}