import os
from flask import g
from supabase import create_client, Client
from dotenv import load_dotenv
from api.utils.logger_config import logger

load_dotenv()

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
SUPABASE_ANON_KEY = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")

if not SUPABASE_URL or not SUPABASE_ANON_KEY:
    logger.error("Supabase URL or Anon Key not found in environment variables.")


def get_supabase_client() -> Client:

    try:
        supabase_client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
        logger.info("Supabase client created successfully.")

        # Check if user JWT is available in Flask's g context
        user_jwt = g.get("user_jwt", None)
        refresh_token = g.get("refresh_token", None)

        if user_jwt:
            supabase_client.auth.set_session(access_token=user_jwt, refresh_token=refresh_token)
            logger.info("Supabase client authenticated with user JWT and refresh token.")
        else:
            logger.info("No user JWT found. Supabase client created without authentication.")

        return supabase_client
    except Exception as e:
        logger.error(f"Error creating Supabase client: {e}")
        raise
