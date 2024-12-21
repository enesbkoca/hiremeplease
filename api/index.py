import json
import os
import uuid

from rq import Queue
from redis import Redis
from flask import Flask, request, jsonify
from openai import OpenAI
from dotenv import load_dotenv

app = Flask(__name__)
load_dotenv()

redis_conn = Redis.from_url(os.getenv("REDIS_URL"))
q = Queue("gpt_response", connection=redis_conn)

# Initialize OpenAI API client
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


def generate_questions(job_description):

    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": "You are a highly skilled interview assistant. Your task is to analyze a job description and generate 5 behavioral questions and 5 technical questions (if applicable) tailored to help the user prepare effectively. Ensure the questions are diverse, relevant to the role, and encourage deep reflection or domain-specific thinking. Include examples where needed."},
            {"role": "user", "content": f"Based on the following job description, generate interview questions:\n\n{job_description}\n\nFocus on behavioral questions that assess the candidate's soft skills, problem-solving abilities, and teamwork. For technical questions, ensure they align with the technical requirements mentioned. Please include a variety of topics covered in the description."}
        ]
    )

    questions = response.choices[0].message.content

    return questions

def generate_and_store_questions(description_id, description):
    # Load job data and set status to processing
    job_data = json.loads(redis_conn.hget("jobs", description_id))
    job_data["status"] = "Processing"
    redis_conn.hset("jobs", description_id, json.dumps(job_data))

    #Generate questions
    questions = generate_questions(description)

    # When questions are generated set status to completed and save them
    job_data["status"] = "Completed"
    job_data["results"] = {
        "title": "Generic Job Title",
        "description": description,
        "questions": questions
    }
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

    job_data = {"status": "Created", "results": None}
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
