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
        "content": """You are an interview analyst. Analyze the given answer and provide feedback on the user's interview answer using the following structured format:
        
        Summary of Strengths: Highlight the key strengths in the user's response, such as clarity, relevance, or effective communication.
        Areas for Improvement: Identify aspects where the user can improve, such as content depth, structure, or delivery.
        Specific Suggestions: Offer clear and actionable suggestions to address the areas for improvement, ensuring they are practical and tailored to the user's needs.
        Practice Exercises (if applicable): Suggest exercises or additional practice opportunities that can help the user enhance their skills in the identified areas.
        Encouragement: Conclude with encouraging remarks to motivate the user and reinforce their capabilities.
        
        In your analysis, consider the content and relevance, structure, delivery, behavioral insights, and technical depth of the answer, depending on the type of question asked.
        Ensure the feedback is concise, focused, and delivered in a supportive manner to foster the user's growth and confidence in interview settings.
        
        Generate a JSON response with the following structure and data types:
        
        {
        "Summary of Strengths": "string",
        "Areas for Improvement": "string",
        "Specific Suggestions": ["string"],
        "Practice Exercises": ["string"],
        "Encouragement": "string"
        }
        
        Populate the fields with relevant feedback based on the user's answer. Output only the JSON object without any additional text."""
    }

    user_message = {"role": "user", "content": answer_text}

    try:
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[prompt, user_message],
            temperature=0.2
        )
    
        # Log the response content to the console
        print(f"RESPONSE FOR ANSWER ANALYSIS: {response.choices[0].message.content}")
        
        return response.choices[0].message.content
    except Exception as e:
        print(f"An error occurred: {e}")
        return None