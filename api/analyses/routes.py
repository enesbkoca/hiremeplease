from flask import Blueprint, request, jsonify

from api.llm_calls import generate_answer_analysis
from api.utils.logger_config import get_logger


logger = get_logger()

analyses_bp = Blueprint('analyses', __name__)


@analyses_bp.route('/', methods=['POST'])
def analyze_answer():
    try:
        data = request.json
        answer_text = data.get("answer_text")

        if not answer_text:
            logger.warning("Attempt to analyze empty answer")
            return jsonify({"error": "Answer text is required"}), 400

        logger.info("Generating answer analysis")
        analysis = generate_answer_analysis(answer_text)

        if analysis:
            logger.debug("Successfully generated answer analysis")
            return jsonify({"analysis": analysis})
        else:
            logger.error("Failed to generate analysis")
            return jsonify({"error": "Failed to generate analysis"}), 500
    except Exception as e:
        logger.error(f"Error analyzing answer: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500
