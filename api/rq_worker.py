import os

from redis import Redis
from rq import Worker
from dotenv import load_dotenv

from .llm_calls import generate_response
from .utils.logger_config import get_logger

logger = get_logger()

load_dotenv()

try:
    redis_conn = Redis.from_url(os.getenv("REDIS_URL"))
    logger.info("Successfully connected to Redis in worker")

    w = Worker(['gpt_response'], connection=redis_conn)
    logger.info("Worker initialized and ready to process jobs")

    w.work()
except Exception as e:
    logger.error(f"Failed to initialize worker: {str(e)}")
    raise
