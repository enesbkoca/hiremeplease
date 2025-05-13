import json
import uuid

from api.services.llm_calls import generate_response
from api.utils.logger_config import get_logger
from api.utils.redis_conn import get_redis_conn

logger = get_logger()
redis_conn = get_redis_conn()

JOB_HASH_NAME = "jobs"


def create_and_process_job(description: str) -> str:
    if not description:
        logger.warning("Attempt to create job without description")
        raise ValueError("Description is required")

    description_id = str(uuid.uuid4())
    logger.info(f"Creating and synchronously processing job ID: {description_id} for description: {description[:50]}...")

    job_data = {
        "id": description_id,
        "status": "Created",
        "description": description,
        "results": None,
        "error": None
    }

    redis_conn.hset(JOB_HASH_NAME, description_id, json.dumps(job_data))
    logger.debug(f"Job {description_id} created and stored in Redis")

    try:
        logger.info(f"Generating response for job {description_id} (synchronous call)")
        response_results = generate_response(description)  # This is the potentially long call

        # Update job data with results and "Completed" status
        job_data["status"] = "Completed"
        job_data["results"] = response_results
        redis_conn.hset(JOB_HASH_NAME, description_id, json.dumps(job_data))
        logger.info(f"Successfully completed job {description_id} synchronously.")

    except Exception as e:
        logger.error(f"Error processing job {description_id} synchronously: {str(e)}")

        job_data["status"] = "Failed"
        job_data["error"] = str(e)
        redis_conn.hset(JOB_HASH_NAME, description_id, json.dumps(job_data))

        # Re-raise the exception so the route handler can catch it and return an appropriate HTTP error
        raise

    return description_id


def get_job_status(job_id: str, speech_service) -> dict:
    """Retrieves job status and adds speech token."""
    logger.debug(f"Fetching job {job_id}")
    job_data_json = redis_conn.hget(JOB_HASH_NAME, job_id)

    if not job_data_json:
        logger.warning(f"Job {job_id} not found")
        return None

    job_data = json.loads(job_data_json)

    try:
        token = speech_service.get_speech_token()  # Assuming speech_service is an instance
        job_data["speech_token"] = token
    except Exception as e:  # Be more specific if speech_service raises custom errors
        logger.error(f"Failed to get speech token for job {job_id}: {str(e)}")
        job_data["speech_token"] = None  # Or decide not to add the key

    logger.info(f"Successfully retrieved job {job_id}")
    return job_data
