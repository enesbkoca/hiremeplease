import json
import os
import uuid
import requests
import time

from rq import Queue
from redis import Redis, ConnectionPool
from flask import Flask, request, jsonify
from dotenv import load_dotenv

from .prompting import generate_response, generate_answer_analysis

app = Flask(__name__)
load_dotenv()

# Create a Redis connection pool
redis_pool = ConnectionPool.from_url(os.getenv("REDIS_URL"))

def get_redis_connection():
    return Redis(connection_pool=redis_pool)

def cleanup_old_jobs():
    """Clean up jobs older than 24 hours"""
    redis_conn = get_redis_connection()
    try:
        all_jobs = redis_conn.hgetall("jobs")
        for job_id, job_data in all_jobs.items():
            job = json.loads(job_data)
            # Add cleanup logic here based on job timestamp
            # This is a placeholder for actual cleanup implementation
    except Exception as e:
        print(f"Error during job cleanup: {e}")

@app.before_request
def before_request():
    cleanup_old_jobs()

def generate_and_store_questions(description_id, description):
    redis_conn = get_redis_connection()
    try:
        # Load job data and set status to processing
        job_data = json.loads(redis_conn.hget("jobs", description_id))
        job_data["status"] = "Processing"
        redis_conn.hset("jobs", description_id, json.dumps(job_data))

        # Generate response
        try:
            response = generate_response(description)
            job_data["status"] = "Completed"
            job_data["results"] = response
        except Exception as e:
            job_data["status"] = "Error"
            job_data["error"] = str(e)
            print(f"Error generating response: {e}")

        redis_conn.hset("jobs", description_id, json.dumps(job_data))
    except Exception as e:
        print(f"Error in generate_and_store_questions: {e}")
        try:
            job_data = {"status": "Error", "error": str(e)}
            redis_conn.hset("jobs", description_id, json.dumps(job_data))
        except:
            print("Failed to store error state in Redis")

@app.route('/api')
def index():
    return "<p>Welcome to the API!</p>"

@app.route('/api/create-job', methods=['POST'])
def create_job():
    data = request.json
    description = data.get("description")

    if not description:
        return jsonify({"error": f"Description is required, but was provided with {description}"}), 400

    description_id = str(uuid.uuid4())
    redis_conn = get_redis_connection()

    try:
        job_data = {
            "status": "Created",
            "description": description,
            "results": None,
            "created_at": int(time.time())
        }

        redis_conn.hset("jobs", description_id, json.dumps(job_data))
        q = Queue("gpt_response", connection=redis_conn)
        q.enqueue(generate_and_store_questions, description_id, description)

        return jsonify({"jobId": description_id})
    except Exception as e:
        return jsonify({"error": f"Failed to create job: {str(e)}"}), 500

@app.route('/api/jobs/<job_id>', methods=['GET'])
def get_job(job_id):
    redis_conn = get_redis_connection()
    try:
        job_data_json = redis_conn.hget("jobs", job_id)
        if not job_data_json:
            return jsonify({"error": "Job Description not found"}), 404

        job_data = json.loads(job_data_json)

        # Get speech token
        try:
            headers = {
                "Ocp-Apim-Subscription-Key": os.getenv("SPEECH_KEY"),
                "Content-Type": "application/x-www-form-urlencoded",
            }
            token_url = f"https://{os.getenv('NEXT_PUBLIC_SPEECH_REGION')}.api.cognitive.microsoft.com/sts/v1.0/issueToken"
            token_response = requests.post(token_url, headers=headers)
            token_response.raise_for_status()
            job_data["speech_token"] = token_response.text
        except requests.exceptions.RequestException as e:
            print(f"Error getting speech token: {e}")
            job_data["speech_token"] = None

        return jsonify(job_data)
    except Exception as e:
        return jsonify({"error": f"Error retrieving job: {str(e)}"}), 500

@app.route('/api/analyze-answer', methods=['POST'])
def analyze_answer():
    data = request.json
    answer_text = data.get("answer_text")

    if not answer_text:
        return jsonify({"error": "Answer text is required"}), 400

    try:
        analysis = generate_answer_analysis(answer_text)
        if not analysis:
            raise ValueError("Failed to generate analysis")
        return jsonify({"analysis": analysis})
    except Exception as e:
        return jsonify({"error": f"Failed to generate analysis: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(debug=True)
