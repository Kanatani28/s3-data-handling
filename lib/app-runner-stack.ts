import { Duration, RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import { Repository } from "aws-cdk-lib/aws-ecr";
import { ManagedPolicy } from "aws-cdk-lib/aws-iam";
import { Code, Function, Runtime } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import * as path from "path";

export class AppRunnerStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // ECR
    const repository = new Repository(this, "AppRunnerRepository", {
      repositoryName: "s3-app-flask",
      removalPolicy: RemovalPolicy.DESTROY,
      imageScanOnPush: true,
    });
  }
}
