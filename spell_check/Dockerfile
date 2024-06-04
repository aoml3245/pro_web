FROM python:3.8-slim

COPY . /app

RUN pip3 install flask requests flask_cors

WORKDIR /app

CMD ["python3", "app.py"]