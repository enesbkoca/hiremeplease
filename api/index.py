import os

from flask import Flask, request, jsonify
from openai import OpenAI
from dotenv import load_dotenv

app = Flask(__name__)
load_dotenv()

@app.route('/api')
def index():
    return "<p>Welcome to the API!</p>"

@app.route('/api/generate-questions', methods=['POST'])
def generate_questions():
    # Initialize OpenAI API client
    client = OpenAI(api_key=os.getenv("API_KEY"))

    data = request.json
    job_description = data.get('jobDescription', '')

    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": "You are a highly skilled interview assistant. Your task is to analyze a job description and generate 5 behavioral questions and 5 technical questions (if applicable) tailored to help the user prepare effectively. Ensure the questions are diverse, relevant to the role, and encourage deep reflection or domain-specific thinking. Include examples where needed."},
            {"role": "user", "content": f"Based on the following job description, generate interview questions:\n\n{job_description}\n\nFocus on behavioral questions that assess the candidate's soft skills, problem-solving abilities, and teamwork. For technical questions, ensure they align with the technical requirements mentioned. Please include a variety of topics covered in the description."}
        ]
    )

    message_content = response.choices[0].message.content

    response_data = {
        'jobDescription': job_description,
        'questions': [message_content]
    }

    return jsonify(response_data)

if __name__ == '__main__':
    app.run(debug=True)
