import os

from redis import Redis
from rq import Worker

from api.utils.redis_conn import get_redis_conn
from api.utils.logger_config import get_logger
from api.utils.services import generate_and_store_questions


logger = get_logger()
redis_conn = get_redis_conn()

try:
    w = Worker(['gpt_response'], connection=redis_conn)
    logger.info("Worker initialized and ready to process jobs")
    w.work()
except Exception as e:
    logger.error(f"Failed to initialize worker: {str(e)}")
    raise
