import { CfnService } from "aws-cdk-lib/aws-apprunner";
import { Construct } from "constructs";
import { Repository } from "aws-cdk-lib/aws-ecr";
import { Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";

interface AppRunnerProps {
  repository: Repository;
}

export class AppRunner extends Construct {
  constructor(scope: Construct, id: string, props: AppRunnerProps) {
    super(scope, id);

    const { repository } = props;

    // Roles
    const instanceRole = new Role(scope, "AppRunnerInstanceRole", {
      assumedBy: new ServicePrincipal("tasks.apprunner.amazonaws.com"),
    });

    const accessRole = new Role(scope, "AppRunnerAccessRole", {
      assumedBy: new ServicePrincipal("build.apprunner.amazonaws.com"),
    });

    //   source: apprunner.Source.fromEcr({
    //     imageConfiguration: {
    //       port: 3000, // Webサーバーを3000ポートとしているので、ここを合わせます
    //     },
    //     repository,
    //     tag: 'latest',
    //   }),
    //   instanceRole: instanceRole,
    //   accessRole: accessRole,
    // Apprunner
    new CfnService(scope, "AppRunnerService", {
      sourceConfiguration: {
        authenticationConfiguration: {
          accessRoleArn: accessRole.roleArn,
        },
        imageRepository: {
          imageIdentifier: `${repository.repositoryName}:latest`,
          imageRepositoryType: "ECR",
          imageConfiguration: {
            port: "80",
            runtimeEnvironmentVariables: [
              { name: "BUCKET_NAME", value: "xxxx" },
            ],
          },
        },
      },
      instanceConfiguration: {
        cpu: "1024",
        memory: "2048",
        instanceRoleArn: instanceRole.roleArn,
      },
    });
  }
}
