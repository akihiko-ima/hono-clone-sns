import * as cdk from "aws-cdk-lib/core";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import * as path from "path";
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class HonoCloneSnsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, { stackName: "Hono-Clone-SNS" });

    const fn = new NodejsFunction(this, "lambda", {
      entry: path.join(__dirname, "../lambda/index.ts"),
      handler: "handler",
      runtime: lambda.Runtime.NODEJS_22_X,

      bundling: {
        commandHooks: {
          beforeBundling(inputDir: string, outputDir: string) {
            return [
              // Drizzle の meta フォルダをそのままコピーする
              `mkdir -p ${outputDir}/drizzle/meta`,
              `cp -r ${inputDir}/drizzle/meta ${outputDir}/drizzle/`,
            ];
          },
          afterBundling() {
            return [];
          },
          beforeInstall() {
            return [];
          },
        },
      },
    });

    // IAM認証
    const fnUrl = fn.addFunctionUrl({
      authType: lambda.FunctionUrlAuthType.AWS_IAM,
    });

    new cdk.CfnOutput(this, "lambdaUrl", {
      value: fnUrl.url!,
    });
  }
}
