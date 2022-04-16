FROM python:3.9

WORKDIR /app

ADD src/requirements.txt /app

# COPY ./src /app

RUN pip install -r requirements.txt

CMD ["python", "index.py"]