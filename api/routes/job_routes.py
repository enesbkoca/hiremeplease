from flask import request, jsonify

from api.services import job_service
from api.utils.auth_tools import login_optional, login_required
from api.utils.logger_config import logger


def register_job_routes(app):
    logger.debug("Registering job routes")

    @app.route('/api/jobs', methods=['POST'])
    @login_optional
    def create_job_initiate_route():

        try:
            data = request.json
            description = data.get("description")

            if not description:
                return jsonify({"error": "Description is required"}), 400

            job_id = job_service.initiate_job_creation(description)

            if job_id:
                return jsonify({"jobId": job_id}), 202
            else:
                return jsonify({"error": "Failed to initiate job creation"}), 500

        except ValueError as ve:
            logger.warning(f"Validation error creating job: {str(ve)}")
            return jsonify({"error": str(ve)}), 400
        except Exception as e:
            logger.error(f"Error creating job: {str(e)}")
            return jsonify({"error": "Internal server error creating job"}), 500

    @app.route('/api/internal/process-job-background', methods=['POST'])
    @login_optional
    def process_job_background_route():
        logger.debug("Processing background job route")
        try:
            data = request.json
            job_description_id_str = data.get("job_description_id")

            if not job_description_id_str:
                logger.error("Background route: job_description_id missing in payload.")
                return jsonify({"error": "job_description_id is required"}), 400

            logger.info(f"Background route: Received request to process job {job_description_id_str}")
            job_service.process_job_background_task(job_description_id_str)

            return jsonify({"message": "Background processing acknowledged"}), 200
        except Exception as e:
            logger.error(f"Error in process_job_background_route: {e}")
            return jsonify({"error": "Internal server error handling background task trigger"}), 500

    @app.route('/api/jobs/<job_id>', methods=['GET'])
    @login_optional
    def get_job_route(job_id):
        try:
            details = job_service.get_job_details(job_id)
            if details:
                return jsonify(details)
            else:
                return jsonify({"error": "Job not found"}), 404

        except ConnectionError as ce:
            logger.error(f"Speech service connection error for job {job_id}: {str(ce)}")
            return jsonify({"error": "Service temporarily unavailable while fetching speech token"}), 503

        except Exception as e:
            logger.error(f"Error retrieving job {job_id}: {str(e)}")
            return jsonify({"error": "Internal server error retrieving job"}), 500
