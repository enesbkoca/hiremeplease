from flask import request, jsonify
from api.services.analysis_service import perform_answer_analysis
from api.utils.logger_config import get_logger

logger = get_logger()


def register_analysis_routes(app):
    logger.debug("Registering analysis routes")

    @app.route('/api/analyses', methods=['POST'])
    def analyze_answer():
        try:
            data = request.json
            answer_text = data.get("answer_text")

            analysis_result = perform_answer_analysis(answer_text)
            return jsonify({"analysis": analysis_result}), 200

        except ValueError as ve:
            logger.warning("Validation error analyzing answer: {str(ve)}")
            return jsonify({"error": str(ve)}), 400

        except Exception as e:
            logger.error(f"Error analyzing answer: {str(e)}")
            return jsonify({"error": "Internal server error during analysis"}), 500
