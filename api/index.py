import os
import uuid
import time
import threading

from flask import Flask, request, jsonify
from openai import OpenAI
from dotenv import load_dotenv

app = Flask(__name__)
load_dotenv()

jobs = {}

# Initialize OpenAI API client
client = OpenAI(api_key=os.getenv("API_KEY"))


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

def process_job(description_id, description):
    print("Processing job with id ", description_id)

    questions = generate_questions(description)

    jobs[description_id] = {
        "title": "Generic Job Title",
        "description": description,
        "questions": questions
    }

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

    threading.Thread(target=process_job, args=(description_id, description)).start()

    return jsonify({"jobId": description_id})

@app.route('/api/jobs/<job_id>', methods=['GET'])
def get_job(job_id):
    job = jobs.get(job_id)
    if job:
        return jsonify(job)
    else:
        return jsonify({"error": "Job Description not found"}), 404

if __name__ == '__main__':
    app.run(debug=True)
