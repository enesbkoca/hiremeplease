import os

from dotenv import load_dotenv
from rq import Queue
from redis import Redis

from api.utils.logger_config import get_logger

logger = get_logger()
load_dotenv()

_redis_conn = None

def get_redis_conn():
    """
    Returns the Redis connection object. Initializes the connection on the first call.
    Subsequent calls return the existing connection.
    """
    global _redis_conn

    if _redis_conn is None:
        try:
            redis_conn = Redis.from_url(os.getenv("REDIS_URL"))
            q = Queue("gpt_response", connection=redis_conn)
            logger.info("Successfully connected to Redis and initialized queue")
        except Exception as e:
            logger.error(f"Failed to connect to Redis: {str(e)}")
            raise
    return _redis_conn