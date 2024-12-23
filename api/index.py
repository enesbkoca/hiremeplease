import json
import os
import uuid

from rq import Queue
from redis import Redis
from flask import Flask, request, jsonify
from dotenv import load_dotenv

from.prompting import generate_response

app = Flask(__name__)
load_dotenv()

redis_conn = Redis.from_url(os.getenv("REDIS_URL"))
q = Queue("gpt_response", connection=redis_conn)

def generate_and_store_questions(description_id, description):
    # Load job data and set status to processing
    job_data = json.loads(redis_conn.hget("jobs", description_id))
    job_data["status"] = "Processing"
    redis_conn.hset("jobs", description_id, json.dumps(job_data))

    #Generate response
    response = generate_response(description)

    # When response are generated set status to completed and save them
    job_data["status"] = "Completed"
    job_data["results"] = response

    redis_conn.hset("jobs", description_id, json.dumps(job_data))

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

    job_data = {"status": "Created",
                "description": description,
                "results": None}

    redis_conn.hset("jobs", description_id, json.dumps(job_data))
    q.enqueue(generate_and_store_questions, description_id, description)

    return jsonify({"jobId": description_id})

@app.route('/api/jobs/<job_id>', methods=['GET'])
def get_job(job_id):
    job_data_json = redis_conn.hget("jobs", job_id)

    if job_data_json:
        job_data = json.loads(job_data_json)
        return jsonify(job_data)
    else:
        return jsonify({"error": "Job Description not found"}), 404

if __name__ == '__main__':
    app.run(debug=True)
