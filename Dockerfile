FROM python:3.12-bookworm
LABEL authors="enesb"
WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY api/. /app/api

# Use ENTRYPOINT to set the main command
ENTRYPOINT ["python3", "-m", "api.rq_worker"]