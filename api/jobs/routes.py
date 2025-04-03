import json
import os
import uuid
import requests

from flask import Blueprint, request, jsonify

from api.jobs.services import generate_and_store_questions
from api.utils.logger_config import get_logger
from api.utils.redis_conn import get_redis_conn

logger = get_logger()

jobs_bp = Blueprint('jobs', __name__)

@jobs_bp.route('/', methods=['GET'])
def jobs_welcome():
    return "<p>Welcome to /api/jobs!</p>"


@jobs_bp.route('/', methods=['POST'])
def create_job():
    redis_conn = get_redis_conn()  # Get the Redis connection
    if redis_conn is None:
        logger.error("Redis connection not available in create_job.")
        return jsonify({"error": "Redis connection error"}), 500

    try:
        data = request.json
        description = data.get("description")

        if not description:
            logger.warning("Attempt to create job without description")
            return jsonify({"error": f"Description is required, but was provided with {description}"}), 400

        description_id = str(uuid.uuid4())
        logger.info(f"Creating new job with ID: {description_id} \n with prompt: {description}")

        job_data = {
            "status": "Created",
            "description": description,
            "results": None
        }



        redis_conn.hset("jobs", description_id, json.dumps(job_data))
        q.enqueue(generate_and_store_questions, description_id, description)

        logger.debug(f"Job {description_id} successfully queued")
        return jsonify({"jobId": description_id})
    except Exception as e:
        logger.error(f"Error creating job: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

@jobs_bp.route('/<job_id>', methods=['GET'])
def get_job(job_id):
    redis_conn = get_redis_conn()
    if redis_conn is None:
        logger.error("Redis connection not available in get_job.")
        return jsonify({"error": "Redis connection error"}), 500

    try:
        logger.debug(f"Fetching job {job_id}")
        job_data_json = redis_conn.hget("jobs", job_id)

        if not job_data_json:
            logger.warning(f"Job {job_id} not found")
            return jsonify({"error": "Job Description not found"}), 404

        headers = {
            "Ocp-Apim-Subscription-Key": os.getenv("SPEECH_KEY"),
            "Content-Type": "application/x-www-form-urlencoded",
        }

        token_url = f"https://{os.getenv('NEXT_PUBLIC_SPEECH_REGION')}.api.cognitive.microsoft.com/sts/v1.0/issueToken"

        logger.debug("Requesting speech token")
        token_response = requests.post(token_url, headers=headers)

        if not token_response.ok:
            logger.error(f"Failed to get speech token: {token_response.status_code}")
            return jsonify({"error": "Failed to get speech token"}), 500

        job_data = json.loads(job_data_json)
        job_data["speech_token"] = token_response.text

        logger.info(f"Successfully retrieved job {job_id}")
        return jsonify(job_data)
    except Exception as e:
        logger.error(f"Error retrieving job {job_id}: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500
