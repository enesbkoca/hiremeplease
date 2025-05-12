import json

from api.utils.logger_config import get_logger
from api.utils.redis_conn import get_redis_conn
from api.services.llm_calls import generate_response

logger = get_logger()
redis_conn = get_redis_conn()

def generate_and_store_questions(description_id, description):
    try:
        # Load job data and set status to processing
        logger.debug(f"Processing job {description_id}")
        job_data = json.loads(redis_conn.hget("jobs", description_id))
        job_data["status"] = "Processing"
        redis_conn.hset("jobs", description_id, json.dumps(job_data))

        # Generate response
        logger.info(f"Generating response for job {description_id}")
        response = generate_response(description)

        # When response are generated set status to completed and save them
        job_data["status"] = "Completed"
        job_data["results"] = response

        redis_conn.hset("jobs", description_id, json.dumps(job_data))
        logger.info(f"Successfully completed job {description_id}")
    except Exception as e:
        logger.error(f"Error processing job {description_id}: {str(e)}")
        job_data["status"] = "Failed"
        job_data["error"] = str(e)
        redis_conn.hset("jobs", description_id, json.dumps(job_data))
        raise
