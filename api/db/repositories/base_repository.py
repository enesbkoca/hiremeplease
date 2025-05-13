from api.db.supabase_client import get_supabase_client
from api.utils.logger_config import logger


class BaseRepository:
    def __init__(self, table_name: str):
        self.client = get_supabase_client()
        self.table_name = table_name
        self.logger = logger

    def _handle_supabase_error(self, error, operation: str):
        self.logger.error(f"Supabase {operation} on table {self.table_name} error: {error}")

        return None
