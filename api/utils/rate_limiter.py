from flask_limiter import Limiter
from flask import g

from api.utils.logger_config import logger


def get_user_id_from_g():
    user_id = g.get("user_id", None)
    if not user_id:
        raise ValueError("g.user_id not set for rate limiting")
    return str(user_id)


limiter = Limiter(
    key_func=get_user_id_from_g,
    storage_uri="memory://",
    headers_enabled=True
)

