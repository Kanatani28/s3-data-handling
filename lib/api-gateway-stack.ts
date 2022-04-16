import { Duration, Stack, StackProps } from "aws-cdk-lib";
import { Cors, LambdaIntegration, RestApi } from "aws-cdk-lib/aws-apigateway";
import { ManagedPolicy } from "aws-cdk-lib/aws-iam";
import { Code, Function, Runtime } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import * as path from "path";

export class APIGatewayStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const env = this.node.tryGetContext("env");
    const BUCKET_NAME = this.node.tryGetContext(env).environment.BUCKET_NAME;

    // Lambdaの定義
    const LAMBDA_FUNCTION_DIR = path.join(__dirname, "../app/lambda");

    const getSingleObjectFunction = new Function(
      this,
      "GetSingleObjectFunction",
      {
        code: Code.fromAsset(`${LAMBDA_FUNCTION_DIR}`),
        handler: "get_single_object.handler",
        runtime: Runtime.PYTHON_3_9,
        // ファイルの大きさによっては時間がかかるのでタイムアウト値を調整
        timeout: Duration.seconds(30),
        environment: {
          BUCKET_NAME,
        },
      }
    );
    getSingleObjectFunction.role?.addManagedPolicy(
      ManagedPolicy.fromAwsManagedPolicyName("AmazonS3ReadOnlyAccess")
    );

    const getSelectedObjectsFunction = new Function(
      this,
      "GetSelectedObjectsFunction",
      {
        code: Code.fromAsset(`${LAMBDA_FUNCTION_DIR}`),
        handler: "get_selected_objects.handler",
        runtime: Runtime.PYTHON_3_9,
        // ファイルの大きさによっては時間がかかるのでタイムアウト値を調整
        timeout: Duration.seconds(30),
        environment: {
          BUCKET_NAME,
        },
      }
    );
    getSelectedObjectsFunction.role?.addManagedPolicy(
      ManagedPolicy.fromAwsManagedPolicyName("AmazonS3ReadOnlyAccess")
    );

    const getObjectsByPrefixFunction = new Function(
      this,
      "GetObjectsByPrefixFunction",
      {
        code: Code.fromAsset(`${LAMBDA_FUNCTION_DIR}`),
        handler: "get_objects_by_prefix.handler",
        runtime: Runtime.PYTHON_3_9,
        // ファイルの大きさによっては時間がかかるのでタイムアウト値を調整
        timeout: Duration.seconds(30),
        environment: {
          BUCKET_NAME,
        },
      }
    );
    getObjectsByPrefixFunction.role?.addManagedPolicy(
      ManagedPolicy.fromAwsManagedPolicyName("AmazonS3ReadOnlyAccess")
    );

    // API Gatewayの定義
    const api = new RestApi(this, "S3DataHandlingApi", {
      // CORSの設定。状況に応じて適宜変える
      defaultCorsPreflightOptions: {
        allowOrigins: Cors.ALL_ORIGINS,
        allowMethods: ["GET", "OPTIONS"],
        allowHeaders: Cors.DEFAULT_HEADERS,
        disableCache: true,
      },
      // デプロイする環境 状況に応じて適宜変える
      deployOptions: {
        stageName: env,
      },
      // 【重要】バイナリメディアタイプの指定
      binaryMediaTypes: ["application/zip", "image/png"],
    });
    api.root
      .addResource("get-single-object")
      .addResource("{key}")
      .addMethod("GET", new LambdaIntegration(getSingleObjectFunction));
    api.root
      .addResource("get-selected-objects")
      .addMethod("GET", new LambdaIntegration(getSelectedObjectsFunction));
    api.root
      .addResource("get-objects-by-prefix")
      .addMethod("GET", new LambdaIntegration(getObjectsByPrefixFunction));
  }
}
