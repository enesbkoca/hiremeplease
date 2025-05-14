from typing import Any, Dict, Optional
from uuid import UUID, uuid4

from .base_repository import BaseRepository


class JobDescriptionRepository(BaseRepository):
    def __init__(self):
        super().__init__("job_descriptions")

    def create(self, description_id: UUID, description: str, user_id: UUID) -> Optional[Dict[str, Any]]:
        """Create a new job description."""
        if not self.client:
            self.logger.error("Supabase client is not initialized. Cannot create job description.")
            return None

        try:
            data, count = self.client.table(self.table_name).insert({
                "id": str(description_id),
                "title": None,
                "description": description,
                "user_id": str(user_id),
                "status": "created"
            }).execute()

            if data and len(data[1]) > 0:
                self.logger.info(f"Created job description with ID: {data[1][0]['id']}")
                return data[1][0]  # Return the created record

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
            data, count = self.client.table(self.table_name)\
                .select("*")\
                .eq("id", job_description_id)\
                .execute()

            if data and len(data[1]) > 0:
                self.logger.info(f"Retrieved job description with ID: {job_description_id}")
                return data[1][0]

            self.logger.warning(f"No job description found with ID: {job_description_id}")
            return None

        except Exception as e:
            return self._handle_supabase_error(e, f"get_by_id ({job_description_id})")

    def update_status(self, job_description_id, new_status):
        """Update the status of a job description."""
        if not self.client:
            self.logger.error("Supabase client is not initialized. Cannot update job description status.")
            return None

        try:
            data, count = self.client.table(self.table_name)\
                .update({"status": new_status})\
                .eq("id", job_description_id)\
                .execute()

            if data and len(data[1]) > 0:
                self.logger.info(f"Updated job description with ID: {job_description_id} to status: {new_status}")
                return data[1][0]

            self.logger.warning(f"No job description found with ID: {job_description_id} to update status.")
            return None

        except Exception as e:
            return self._handle_supabase_error(e, f"update_status ({job_description_id})")

    def update_title(self, job_description_id, job_title):
        """Update the title of a job description."""
        if not self.client:
            self.logger.error("Supabase client is not initialized. Cannot update job description title.")
            return None

        try:
            data, count = self.client.table(self.table_name)\
                .update({"title": job_title})\
                .eq("id", job_description_id)\
                .execute()

            if data and len(data[1]) > 0:
                self.logger.info(f"Updated job description with ID: {job_description_id} to title: {job_title}")
                return data[1][0]

            self.logger.warning(f"No job description found with ID: {job_description_id} to update title.")
            return None

        except Exception as e:
            return self._handle_supabase_error(e, f"update_title ({job_description_id})")
