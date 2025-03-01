import os
import json
import traceback

import openai
from openai import OpenAI
from dotenv import load_dotenv

from .logger_config import get_logger

logger = get_logger()

load_dotenv()

from enum import Enum
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional

class BehavioralQuestion(BaseModel):
    question: str
    category: str
    explanation: str

class TechnicalQuestion(BaseModel):
    question: str
    skill_area: str
    explanation: str

class InterviewPreparation(BaseModel):
    job_title: str
    industry: str
    experience_level: str
    behavioral_questions: List[BehavioralQuestion]
    technical_questions: List[TechnicalQuestion]
    additional_notes: str



# Define the tag types as an enumeration
class TagType(str, Enum):
    MUST_SAY = "must-say"
    GOOD = "good"
    UNNECESSARY = "unnecessary"
    SHOULD_BE_AVOIDED = "should-be-avoided"

# Model for each tagged phrase
class TaggedPhrase(BaseModel):
    phrase: str
    type: TagType
    comment: str

# Main feedback model with alias for JSON keys
class Feedback(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    
    summary_of_strengths: str = Field(alias="Summary of Strengths")
    areas_for_improvement: str = Field(alias="Areas for Improvement")
    specific_suggestions: List[str] = Field(alias="Specific Suggestions")
    practice_exercises: List[str] = Field(alias="Practice Exercises")
    encouragement: str = Field(alias="Encouragement")
    tagged_answer: List[TaggedPhrase] = Field(alias="tagged_answer")


# Initialize OpenAI API client
try:
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    logger.info("OpenAI client initialized successfully")
except Exception as e:
    logger.error(f"Failed to initialize OpenAI client: {str(e)}\n{traceback.format_exc()}")
    raise

def generate_response(job_description: str) -> Optional[dict]:
    """
    Generates structured interview questions based on a job description using OpenAI Chat Completion.

    Args:
        job_description: The job description as a string.

    Returns:
        A dictionary representing the structured JSON output, or None if an error occurs.
    """
    logger.debug(f"Generating response for job description of length: {len(job_description)}")

    prompt = {
        "role": "system",
        "content": """You are a highly skilled interview assistant. Your task is to analyze a job description and generate 5 behavioral questions and 5 technical questions (if applicable) tailored to help the user prepare effectively. Ensure the questions are diverse, relevant to the role, and encourage deep reflection or domain-specific thinking. Include examples where needed.
        Your response must strictly adhere to a specific JSON format and contain no text or content outside of the JSON structure. Ensure the response is well-structured, valid JSON, and can be directly parsed by a system without errors."""
    }
    user_message = {"role": "user", "content": job_description}

    try:
        logger.info("Sending request to OpenAI API")
        response = client.beta.chat.completions.parse(
            model="gpt-4o-mini",
            messages=[prompt, user_message],
            response_format=InterviewPreparation,
            temperature=0.2
        )
        
        logger.info("Successfully generated interview questions")
        return response.model_dump()

    except json.JSONDecodeError as e:
        error_msg = f"JSON Decode Error: {str(e)}"
        logger.error(f"{error_msg}\nRaw Response: {response.choices[0].message.content}\n{traceback.format_exc()}")
        return None
    except openai.APIConnectionError as e:
        error_msg = f"Failed to connect to OpenAI API: {str(e)}"
        logger.error(f"{error_msg}\n{traceback.format_exc()}")
        return None
    except openai.APIError as e:
        error_msg = f"OpenAI API returned an API Error: {str(e)}"
        logger.error(f"{error_msg}\n{traceback.format_exc()}")
        return None
    except openai.RateLimitError as e:
        error_msg = f"OpenAI API request exceeded rate limit: {str(e)}"
        logger.error(f"{error_msg}\n{traceback.format_exc()}")
        return None
    except Exception as e:
        error_msg = f"An unexpected error occurred: {str(e)}"
        logger.error(f"{error_msg}\n{traceback.format_exc()}")
        return None

def generate_answer_analysis(answer_text: str) -> Optional[dict]:
    logger.debug(f"Analyzing answer of length: {len(answer_text)}")
    
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
        - The output should be a JSON object containing the following keys:
            - 'Summary of Strengths': a string summarizing the strengths in the user's response.
            - 'Areas for Improvement': a string identifying areas where the user can improve.
            - 'Specific Suggestions': a list of strings providing actionable suggestions for improvement.
            - 'Practice Exercises': a list of strings suggesting exercises or practice opportunities.
            - 'Encouragement': a string offering encouraging remarks.
            - 'tagged_answer': a list of objects, each containing:
                - 'phrase': a string representing the tagged phrase from the user's answer.
                - 'type': a string indicating the type of tag ('must-say', 'good', 'unnecessary', or 'should-be-avoided').
                - 'comment': a string providing a constructive comment on the tagged phrase.
        - Only include tags and comments for phrases where meaningful feedback is needed. Do not tag every phrase.

        6. **Interview Context**:
        - Always consider the context of the interview question and the skills or qualities the interviewer is likely evaluating.
        - Tailor your feedback to help the user demonstrate their expertise, problem-solving abilities, and alignment with the job requirements.

        Output only the JSON object without any additional text."""
    }

    user_message = {"role": "user", "content": answer_text}

    try:
        logger.info("Sending answer analysis request to OpenAI API")
        response = client.beta.chat.completions.parse(
            model="gpt-4o-mini",
            messages=[prompt, user_message],
            response_format=Feedback,
            temperature=0.2
        )

        logger.info("Successfully generated answer analysis")
        return response.model_dump()

    except Exception as e:
        error_msg = f"Error generating answer analysis: {str(e)}"
        logger.error(f"{error_msg}\n{traceback.format_exc()}")
        return None