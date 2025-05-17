from typing import Any, Dict, Optional
from uuid import UUID

from .base_repository import BaseRepository


class JobDescriptionRepository(BaseRepository):
    def __init__(self, db_client):
        super().__init__("job_descriptions", db_client)

    def create(self, description_id: UUID, description: str, user_id: UUID) -> Optional[Dict[str, Any]]:
        """Create a new job description."""
        if not self.client:
            self.logger.error("Supabase client is not initialized. Cannot create job description.")
            return None

        try:
            payload = {
                    "id": str(description_id),
                    "title": None,
                    "description": description,
                    "status": "created"
            }

            if user_id is not None:
                payload["user_id"] = str(user_id)

            data, count = self.client.table(self.table_name).insert(payload).execute()

            if data and len(data[1]) > 0:
                self.logger.info(f"Created job description with ID: {data[1][0]['id']}. User ID: {user_id if user_id else 'Anonymous'}")
                return data[1][0]

            self.logger.warning(f"No data returned after inserting job description: {description}")
            return None

        except Exception as e:
            return self._handle_supabase_error(e, "create")

    def get_by_id(self, job_description_id: UUID) -> Optional[Dict[str, Any]]:
        """Get a job description by its ID."""
        if not self.client:
            self.logger.error("Supabase client is not initialized. Cannot get job description.")
            return None

        try:
            query = self.client.table(self.table_name)\
                .select("*")\
                .eq("id", job_description_id)

            data, count = query.execute()

            if data and len(data[1]) > 0:
                self.logger.info(f"Retrieved job description with ID: {job_description_id}")
                return data[1][0]

            self.logger.warning(f"No job description found with ID: {job_description_id}")
            return None

        except Exception as e:
            return self._handle_supabase_error(e, f"get_by_id ({job_description_id})")

    def update_status(self, job_description_id: UUID, new_status: str):
        """Update the status of a job description."""
        if not self.client:
            self.logger.error("Supabase client is not initialized. Cannot update job description status.")
            return None

        try:
            query = self.client.table(self.table_name)\
                .update({"status": new_status})\
                .eq("id", job_description_id)

            data, count = query.execute()

            if data and len(data[1]) > 0:
                self.logger.info(f"Updated job description with ID: {job_description_id} to status: {new_status}")
                return data[1][0]

            self.logger.warning(f"No job description found with ID: {job_description_id} to update status.")
            return None

        except Exception as e:
            return self._handle_supabase_error(e, f"update_status ({job_description_id})")

    def update_title(self, job_description_id: UUID, job_title: str):
        """Update the title of a job description."""
        if not self.client:
            self.logger.error("Supabase client is not initialized. Cannot update job description title.")
            return None

        try:
            query = self.client.table(self.table_name)\
                .update({"title": job_title})\
                .eq("id", job_description_id)

            data, count = query.execute()

            if data and len(data[1]) > 0:
                self.logger.info(f"Updated job description with ID: {job_description_id} to title: {job_title}")
                return data[1][0]

            self.logger.warning(f"No job description found with ID: {job_description_id} to update title.")
            return None

        except Exception as e:
            return self._handle_supabase_error(e, f"update_title ({job_description_id})")
    
    def get_user_job_details(self, user_id: Optional[UUID] = None) -> Optional[Dict[str, Any]]:
        """Get all job descriptions filtered by user_id."""
        if not self.client:
            self.logger.error("Supabase client is not initialized. Cannot get job descriptions.")
            return None

        try:
            query = self.client.table(self.table_name)\
                .select("*")\
                .order("created_at", desc=True)

            if user_id:
                query = query.eq("user_id", str(user_id))

            data, count = query.execute()

            if data and len(data[1]) > 0:
                self.logger.info(f"Retrieved {len(data[1])} job descriptions.")
                self.logger.debug(f"Job descriptions data: {data[1]}")
                return data

            self.logger.warning("No job descriptions found.")
            return None

        except Exception as e:
            return self._handle_supabase_error(e, "get_all")
