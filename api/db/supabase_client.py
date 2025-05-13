import os
from supabase import create_client, Client
from dotenv import load_dotenv
from api.utils.logger_config import logger

load_dotenv()

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    logger.error("Supabase URL or Key not found in environment variables.")

_supabase_client: Client = None


def get_supabase_client() -> Client:
    global _supabase_client

    if _supabase_client is None:
        try:
            _supabase_client = create_client(SUPABASE_URL, SUPABASE_KEY)
            logger.info("Supabase client created successfully.")
        except Exception as e:
            logger.error(f"Error creating Supabase client: {e}")
            raise

    return _supabase_client
