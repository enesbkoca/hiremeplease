import os
from typing import Optional
from uuid import UUID

import jwt

from dotenv import load_dotenv
from jwt import ExpiredSignatureError, InvalidTokenError, DecodeError

from api.utils.logger_config import logger

load_dotenv()

SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET")


def get_user_id_from_request(request) -> Optional[UUID]:
    """
    Extracts the user ID from the Authorization header.
    """
    if not SUPABASE_JWT_SECRET:
        logger.error("SUPABASE_JWT_SECRET is not configured.")
        return None

    auth_header = request.headers.get("Authorization")

    if not auth_header:
        logger.warning("Authorization header is missing")
        return None

    if not auth_header.startswith("Bearer "):
        logger.warning("Invalid authorization header format")
        raise ValueError("Invalid authorization header format")

    token = auth_header.split(" ")[1]
    logger.debug(f"Extracted token from Authorization header: {token}")

    try:
        payload = jwt.decode(
            token,
            SUPABASE_JWT_SECRET,
            algorithms=['HS256'],
            audience="authenticated",
        )
        user_id = payload.get('sub')

        if not user_id:
            logger.warning("User ID (sub claim) not found in token payload.")
            return None  # Or raise a custom InvalidTokenPayloadError

        # Ensure user_id is a string, as per the type hint, though 'sub' usually is.
        if not isinstance(user_id, str):
            logger.warning(f"User ID (sub claim) is not a string: {type(user_id)}. Payload: {payload}")
            return None

        logger.info(f"User ID extracted: {user_id}")
        return UUID(user_id)

    except ExpiredSignatureError:
        logger.warning("Token has expired.")
        return None  # Or raise a custom TokenExpiredError
    except InvalidTokenError as e:  # Catches various JWT errors like invalid signature, malformed token etc.
        logger.warning(f"Invalid token: {e}")
        return None  # Or raise a custom InvalidTokenError
    except DecodeError as e:  # More specific error for decoding issues if not caught by InvalidTokenError
        logger.warning(f"Token decode error: {e}")
        return None
    except Exception as e:
        # Catch any other unexpected errors during decoding, though PyJWT errors should cover most.
        logger.error(f"An unexpected error occurred during token processing: {e}")
        return None
