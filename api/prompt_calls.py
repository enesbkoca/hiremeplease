import os
import json
import traceback
from typing import Optional

import openai
from openai import OpenAI
from dotenv import load_dotenv

from .logger_config import get_logger
from .utils.models import InterviewPreparation, Feedback
from .utils.prompts import question_generation_prompt, answer_analysis_prompt

logger = get_logger()
load_dotenv()


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


    user_message = {"role": "user", "content": job_description}

    try:
        logger.info("Sending request to OpenAI API")
        response = client.beta.chat.completions.parse(
            model="gpt-4o-mini",
            messages=[question_generation_prompt, user_message],
            response_format=InterviewPreparation,
            temperature=0.2
        )
        
        logger.info("Successfully generated interview questions")
        json_output = response.choices[0].message
        return json.loads(json_output.content)

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
    


    user_message = {"role": "user", "content": answer_text}

    try:
        logger.info("Sending answer analysis request to OpenAI API")
        response = client.beta.chat.completions.parse(
            model="gpt-4o-mini",
            messages=[answer_analysis_prompt, user_message],
            response_format=Feedback,
            temperature=0.2
        )

        logger.info("Successfully generated answer analysis")
        json_output = response.choices[0].message
        return json.loads(json_output.content)

    except Exception as e:
        error_msg = f"Error generating answer analysis: {str(e)}"
        logger.error(f"{error_msg}\n{traceback.format_exc()}")
        return None