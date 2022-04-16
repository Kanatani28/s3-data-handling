from flask import Flask, request, make_response
import boto3
from urllib.parse import quote
import os

s3 = boto3.resource("s3")
BUCKET_NAME = os.environ["BUCKET_NAME"]
bucket = s3.Bucket(BUCKET_NAME)
# 低レベルAPI用クライアント
s3_client = boto3.client("s3")

app = Flask(__name__)


@app.route("/get_single_object/<path:key>")
def get_single_object(key):
    # バイナリを返すバージョン
    with open("filename", "wb") as data:
      bucket.download_fileobj(key, data)
        
      response = make_response(data.read())
      response.headers.set('Content-Type', 'image/png')
      return response


    # 署名付きURLバージョン
    # url = s3_client.generate_presigned_url(
    #     ClientMethod="get_object",
    #     Params={
    #         "Bucket": BUCKET_NAME,
    #         "Key": key,
    #         # 日本語ファイル名をエンコードするためにquoteに渡している
    #         "ResponseContentDisposition": f"attachment; filename={quote(filename)}",
    #     },
    #     ExpiresIn=3600,
    #     HttpMethod="GET",
    # )


# @app.route("/get_selected_objects")
# def get_selected_objects():
#   target_keys = request.args.getlist('target_key')
#   return f"<h1>Hello, Flask!2 {target_keys[0]} {target_keys[1]}</h1>"

# @app.route("/get_objects_by_prefix")
# def get_objects_by_prefix():
#   prefix = request.args.get('prefix', '')
#   return f"<h1>Hello, Flask!3 {prefix}</h1>"

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=80, debug=True)
