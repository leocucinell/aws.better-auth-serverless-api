import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambdaNodejs from "aws-cdk-lib/aws-lambda-nodejs";
import * as apigw from "aws-cdk-lib/aws-apigateway";
import { CfnOutput } from "aws-cdk-lib";
import * as dotenv from "dotenv";

dotenv.config();

console.log("DATABASE_URL from env:", process.env.DATABASE_URL);

export class BetterAuthApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // SECTION - API Gateway
    const api = new apigw.RestApi(this, "MyRestAPI", {
      restApiName: "MyRestAPI",
      defaultCorsPreflightOptions: {
        allowOrigins: apigw.Cors.ALL_ORIGINS,
        allowMethods: apigw.Cors.ALL_METHODS,
      },
      apiKeySourceType: apigw.ApiKeySourceType.HEADER,
    });
    const apiKey = new apigw.ApiKey(this, "MyApiKey");
    const usagePlan = new apigw.UsagePlan(this, "usagePlan", {
      name: "MyUsagePlan",
      apiStages: [
        {
          api: api,
          stage: api.deploymentStage,
        },
      ],
    });
    usagePlan.addApiKey(apiKey);

    // SECTION - Lambda Functions
    const signupLambda = new lambdaNodejs.NodejsFunction(this, "signupLambda", {
      entry: "lib/src/lambdas/signup.ts",
      handler: "handler",
      timeout: cdk.Duration.seconds(25),
      environment: {
        DATABASE_URL: process.env.DATABASE_URL as string,
      },
    });

    const loginLambda = new lambdaNodejs.NodejsFunction(this, "loginLambda", {
      entry: "lib/src/lambdas/login.ts",
      handler: "handler",
      timeout: cdk.Duration.seconds(25),
      environment: {
        DATABASE_URL: process.env.DATABASE_URL as string,
      },
    });

    const getSessionLambda = new lambdaNodejs.NodejsFunction(
      this,
      "getSessionLambda",
      {
        entry: "lib/src/lambdas/getSession.ts",
        handler: "handler",
        timeout: cdk.Duration.seconds(25),
        environment: {
          DATABASE_URL: process.env.DATABASE_URL as string,
        },
      }
    );

    // SECTION - resource definitions
    const authResource = api.root.addResource("auth");
    const signupResource = authResource.addResource("signup");
    const loginResource = authResource.addResource("login");
    const sessionResource = authResource.addResource("session");

    // SECTION - API Gateway Method Definitions
    const signupIntegration = new apigw.LambdaIntegration(signupLambda);
    const loginIntegration = new apigw.LambdaIntegration(loginLambda);
    const getSessionIntegration = new apigw.LambdaIntegration(getSessionLambda);

    // SECTION - API Gateway Method Definitions
    // api.root.addMethod("POST", signupIntegration);
    signupResource.addMethod("POST", signupIntegration);
    loginResource.addMethod("POST", loginIntegration);
    sessionResource.addMethod("GET", getSessionIntegration);

    // SECTION - Outputs
    new CfnOutput(this, "ApiUrl", {
      value: api.url,
    });
    new CfnOutput(this, "ApiKey", {
      value: apiKey.keyId,
    });
  }
}
