from typing import Dict, List, Any, Optional
from uuid import UUID

from .base_repository import BaseRepository


class QuestionRepository(BaseRepository):
    def __init__(self):
        super().__init__("questions")

    def create_batch(self, questions: List[Dict]):
        if not self.client:
            self.logger.error("Supabase client not initialized. Cannot create questions.")
            return []
        if not questions:
            self.logger.warning("No questions provided for batch creation.")
            return []

        # Ensure UUIDs are strings if they are passed as UUID objects
        for q_data in questions:
            if "job_description_id" in q_data and isinstance(q_data["job_description_id"], UUID):
                q_data["job_description_id"] = str(q_data["job_description_id"])

        try:
            data, count = self.client.table(self.table_name).insert(questions).execute()
            if data and len(data[1]) > 0:
                self.logger.info(f"Successfully inserted {len(data[1])} questions.")
                return data[1]
            self.logger.warning(f"No data returned after batch inserting questions.")
            return []
        except Exception as e:
            self._handle_supabase_error(e, "create_batch")
            return []

    def get_questions_by_job_description_id(self, job_description_id: UUID) -> List[Dict]:
        """Retrieves all questions for a given job_description_id."""
        if not self.client:
            self.logger.error("Supabase client not initialized. Cannot get questions.")
            return []

        try:
            data, count = self.client.table(self.table_name) \
                .select("*") \
                .eq("job_description_id", str(job_description_id)) \
                .execute()

            if data and len(data[1]) > 0:
                self.logger.info(f"Retrieved {len(data[1])} questions for job description ID: {job_description_id}")
                return data[1]

            self.logger.warning(f"No questions found for job description ID: {job_description_id}")
            return []  # No questions found or empty list

        except Exception as e:
            self.logger.error(f"Error retrieving questions for job description ID {job_description_id}: {str(e)}")
            self._handle_supabase_error(e, f"get_by_job_description_id ({job_description_id})")
            return []
