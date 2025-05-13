from api.services.llm_calls import generate_answer_analysis
from api.utils.logger_config import get_logger

logger = get_logger()


def perform_answer_analysis(answer_text):
    """Performs analysis on the provided answer text."""

    if not answer_text:
        logger.warning("Attempt to analyze empty answer")
        raise ValueError("Answer text is required")

    logger.info("Generating answer analysis via LLM call")
    analysis = generate_answer_analysis(answer_text)

    if analysis:
        logger.debug("Successfully generated answer analysis")
        return analysis
    else:
        logger.error("Failed to generate analysis")
        raise Exception("Failed to generate analysis")
