import os

from dotenv import load_dotenv

from redis import Redis

from api.utils.logger_config import get_logger

logger = get_logger()
load_dotenv()


def get_redis_conn():
    """
    Returns the Redis connection object.
    """

    try:
        redis_conn = Redis.from_url(os.getenv("REDIS_URL"))
        logger.info("Successfully connected to Redis and initialized queue")
    except Exception as e:
        logger.error(f"Failed to connect to Redis: {str(e)}")
        raise
    return redis_conn