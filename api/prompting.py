import os
import json

import openai

from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()


# Initialize OpenAI API client
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


def generate_response(job_description):
    """
    Generates structured interview questions based on a job description using OpenAI Chat Completion.

    Args:
        job_description: The job description as a string.

    Returns:
        A dictionary representing the structured JSON output, or None if an error occurs.
    """

    prompt = {
        "role": "system",
        "content": """You are a highly skilled interview assistant. Your task is to analyze a job description and generate 5 behavioral questions and 5 technical questions (if applicable) tailored to help the user prepare effectively. Ensure the questions are diverse, relevant to the role, and encourage deep reflection or domain-specific thinking. Include examples where needed.

Your response must strictly adhere to the following JSON format and contain no text or content outside of the JSON structure:

{
  "job_title": "string",
  "industry": "string",
  "experience_level": "string",
  "behavioral_questions": [
    {
      "question": "string",
      "category": "string", 
      "explanation": "string"
    }
  ],
  "technical_questions": [
    {
      "question": "string",
      "skill_area": "string", 
      "explanation": "string"
    }
  ],
  "additional_notes": "string"
}

Ensure the response is well-structured, valid JSON, and can be directly parsed by a system without errors."""
    }
    user_message = {"role": "user", "content": job_description}

    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[prompt, user_message],
            response_format={"type": "json_object"},
            temperature = 0.2
        )
        json_output = json.loads(response.choices[0].message.content)

        return json_output

    except json.JSONDecodeError as e:
        print(f"JSON Decode Error: {e}")
        print(f"Raw Response: {response.choices[0].message.content}")
        pass
    except openai.APIConnectionError as e:
        # Handle connection error here
        print(f"Failed to connect to OpenAI API: {e}")
        pass
    except openai.APIError as e:
        # Handle API error here, e.g. retry or log
        print(f"OpenAI API returned an API Error: {e}")
        pass
    except openai.RateLimitError as e:
        # Handle rate limit error (we recommend using exponential backoff)
        print(f"OpenAI API request exceeded rate limit: {e}")
        pass
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        pass
    
def generate_answer_analysis(answer_text):
    
    prompt = {
        "role": "system",
        "content": """You are an interview coach with expertise in helping candidates excel in their interviews. Your task is to analyze the user's answer to an interview question and provide constructive feedback to help them improve their response and ace the interview. Follow these guidelines:

        1. **Focus on Constructive Feedback**:
        - Only tag phrases in the user's answer where meaningful improvement or reinforcement is needed.
        - Avoid tagging every phrase; focus on areas that will have the most impact on improving the user's performance in an interview setting.

        2. **Tag Types**:
        - **must-say**: Highlight phrases that are essential to include in an interview answer. These are key points that demonstrate the user's skills, experience, or alignment with the job requirements.
        - **good**: Highlight phrases that are strong and effective. Reinforce these to encourage the user to continue using similar language or structure.
        - **unnecessary**: Highlight phrases that do not add value to the answer or distract from the main point. Suggest removing or rephrasing them.
        - **should-be-avoided**: Highlight phrases that could harm the user's chances in an interview (e.g., filler words, vague language, negative statements). Provide specific alternatives.

        3. **Comments**:
        - For each tagged phrase, provide a **constructive comment** that explains why the phrase is tagged and how the user can improve or reinforce it.
        - Ensure comments are actionable, specific, and tailored to the context of the interview question.

        4. **Feedback Structure**:
        - Provide overall feedback in the following format:
            - **Summary of Strengths**: Highlight the key strengths in the user's response.
            - **Areas for Improvement**: Identify specific areas where the user can improve their answer.
            - **Specific Suggestions**: Offer actionable suggestions to address the areas for improvement.
            - **Practice Exercises (if applicable)**: Suggest exercises or practice opportunities to help the user improve.
            - **Encouragement**: Conclude with encouraging remarks to motivate the user.

        5. **Output Format**:
        - Generate a JSON response with the following structure:
            {
            "Summary of Strengths": "string",
            "Areas for Improvement": "string",
            "Specific Suggestions": ["string"],
            "Practice Exercises": ["string"],
            "Encouragement": "string",
            "tagged_answer": [
                {
                "phrase": "string",
                "type": "must-say | good | unnecessary | should-be-avoided",
                "comment": "string"
                }
            ]
            }
        - Only include tags and comments for phrases where meaningful feedback is needed. Do not tag every phrase.

        6. **Interview Context**:
        - Always consider the context of the interview question and the skills or qualities the interviewer is likely evaluating.
        - Tailor your feedback to help the user demonstrate their expertise, problem-solving abilities, and alignment with the job requirements.

        Output only the JSON object without any additional text."""
    }

    user_message = {"role": "user", "content": answer_text}

    try:
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[prompt, user_message],
            temperature=0.2
        )
        
        return response.choices[0].message.content
    except Exception as e:
        print(f"An error occurred: {e}")
        return None