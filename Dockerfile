FROM python:3.12
LABEL authors="enesb"
WORKDIR /

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["python3", "-m", "api.rq_worker"]