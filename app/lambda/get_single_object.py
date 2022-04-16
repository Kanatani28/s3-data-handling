import boto3
import os
import base64

BUCKET_NAME = os.environ["BUCKET_NAME"]

s3 = boto3.resource('s3')
bucket = s3.Bucket(BUCKET_NAME)


def handler(event, context):
    key  = event['pathParameters']['key']
    
    with open('filename', 'wb') as data:
        bucket.download_fileobj(key, data)
        return {
                "statusCode": 200,
                "headers": {
                    "Content-Type": "image/png",
                    "Access-Control-Allow-Headers": "Content-Type",
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "GET",
                },
                "body": base64.b64encode(data).decode("utf-8"),
                "isBase64Encoded": True,
            }