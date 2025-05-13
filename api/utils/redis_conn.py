import os

from dotenv import load_dotenv
from redis import Redis

from api.utils.logger_config import logger

load_dotenv()

_redis_conn = None


def get_redis_conn():
    """
    Returns the Redis connection object.
    """
    global _redis_conn

    if _redis_conn is None:

        try:
            _redis_conn = Redis.from_url(os.getenv("REDIS_URL"))
            logger.info("Successfully connected to Redis and initialized queue")
        except Exception as e:
            logger.error(f"Failed to connect to Redis: {str(e)}")
            raise

    return _redis_conn
