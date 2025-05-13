import os
import requests

from dotenv import load_dotenv
from api.utils.logger_config import logger

load_dotenv()


class SpeechService:
    def __init__(self):
        self.speech_key = os.getenv("SPEECH_KEY")
        self.speech_region = os.getenv("NEXT_PUBLIC_SPEECH_REGION")
        if not self.speech_key or not self.speech_region:
            logger.error("Speech key or region not configured in environment variables.")

    def get_speech_token(self):
        if not self.speech_key or not self.speech_region:
            raise ConnectionError("Speech service not configured.")

        headers = {
            "Ocp-Apim-Subscription-Key": self.speech_key,
            "Content-Type": "application/x-www-form-urlencoded",
        }
        token_url = f"https://{self.speech_region}.api.cognitive.microsoft.com/sts/v1.0/issueToken"

        logger.debug("Requesting speech token")
        try:
            token_response = requests.post(token_url, headers=headers, timeout=10)
            token_response.raise_for_status()  # Raises HTTPError for bad responses (4xx or 5xx)
            logger.debug("Successfully obtained speech token.")
            return token_response.text
        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to get speech token: {str(e)}")
            raise ConnectionError(f"Failed to get speech token: {str(e)}") from e


default_speech_service = SpeechService()


def get_default_speech_service():
    return default_speech_service
