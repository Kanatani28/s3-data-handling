import boto3
import os
import base64
import zipfile

BUCKET_NAME = os.environ["BUCKET_NAME"]

s3 = boto3.resource('s3')
bucket = s3.Bucket(BUCKET_NAME)


def handler(event, context):
    prefix  = event['queryStringParameters']['prefix']
    # Bucketにあるオブジェクトのうちprefixから始まるものに絞り込む
    object_summaries = bucket.objects.filter(Prefix=prefix).all()
    # Lambdaで一時ファイルを扱う場合は/tmp直下に配置する
    zip_path = "/tmp/data.zip"
    
    # zipファイルを作成する処理
    with zipfile.ZipFile(zip_path, "w", compression=zipfile.ZIP_DEFLATED) as new_zip:
        for summary in object_summaries:
            if summary.key.endswith(".png"):
                # S3オブジェクトを取得する
                s3_object = summary.get()
                # バイナリデータ部分取得
                body = s3_object["Body"].read()

                new_zip.writestr(summary.key, body)
                
    # 作成したzipをレスポンスとして返す処理
    with open(zip_path, "rb") as zip_data:
        zip_bytes = zip_data.read()

        return {
            "statusCode": 200,
            "headers": {
                "Content-Type": "application/zip",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET",
            },
            "body": base64.b64encode(zip_bytes).decode("utf-8"),
            "isBase64Encoded": True,
        }