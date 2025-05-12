import json
import os
import uuid
import requests

from rq import Queue
from flask import Flask, request, jsonify

from api.utils.redis_conn import get_redis_conn
from api.llm_calls import generate_answer_analysis, generate_response
from api.utils.logger_config import get_logger

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

app = Flask(__name__)

@app.route('/api')
def index():
    logger.debug("API entry endpoint called")
    return "<p>Welcome to the API!</p>"

@app.route('/api/analyses', methods=['POST'])
def analyze_answer():
    try:
        data = request.json
        answer_text = data.get("answer_text")

        if not answer_text:
            logger.warning("Attempt to analyze empty answer")
            return jsonify({"error": "Answer text is required"}), 400

        logger.info("Generating answer analysis")
        analysis = generate_answer_analysis(answer_text)

        if analysis:
            logger.debug("Successfully generated answer analysis")
            return jsonify({"analysis": analysis})
        else:
            logger.error("Failed to generate analysis")
            return jsonify({"error": "Failed to generate analysis"}), 500
    except Exception as e:
        logger.error(f"Error analyzing answer: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

@app.route('/api/jobs', methods=['GET'])
def jobs_welcome():
    return "<p>Welcome to /api/jobs!</p>"


@app.route('/api/jobs', methods=['POST'])
def create_job():
    redis_conn = get_redis_conn()  # Get the Redis connection
    q = Queue("gpt_response", connection=redis_conn)

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

@app.route('/api/jobs/<job_id>', methods=['GET'])
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


if __name__ == '__main__':
    app.run(debug=True)