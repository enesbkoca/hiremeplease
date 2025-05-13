import os
import jwt

from dotenv import load_dotenv
from api.utils.logger_config import logger

load_dotenv()

SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET")


def get_user_id_from_request(request) -> str:
    """
    Extracts the user ID from the Authorization header.
    """
    auth_header = request.headers.get("Authorization")

    if not auth_header:
        logger.warning("Authorization header is missing")
        return None

    if not auth_header.startswith("Bearer "):
        logger.warning("Invalid authorization header format")
        raise ValueError("Invalid authorization header format")

    token = auth_header.split(" ")[1]

    payload = jwt.decode(token, SUPABASE_JWT_SECRET, algorithms=['HS256'])
    user_id = payload.get('sub')

    if not user_id:
        logger.warning("User ID not found in token")
        raise ValueError("User ID not found in token")

    logger.info(f"User ID extracted: {user_id}")
    return user_id
