from flask import request, jsonify

from api.services import job_service
from api.services.speech_service import get_default_speech_service
from api.utils.logger_config import logger
from api.utils.redis_conn import get_redis_conn


def register_job_routes(app):
    speech_service = get_default_speech_service()

    @app.route('/api/jobs', methods=['POST'])
    def create_job_route():
        redis_conn = get_redis_conn()  # Get the Redis connection

        try:
            data = request.json
            description = data.get("description")

            job_id = job_service.create_and_process_job(description)
            return jsonify({"jobId": job_id}, 201)

        except ValueError as ve:
            logger.warning(f"Validation error creating job: {str(ve)}")
            return jsonify({"error": str(ve)}), 400

        except Exception as e:
            logger.error(f"Error creating job: {str(e)}")
            return jsonify({"error": "Internal server error creating job"}), 500

    @app.route('/api/jobs/<job_id>', methods=['GET'])
    def get_job_route(job_id):

        try:
            job_data = job_service.get_job_status(job_id, speech_service)
            if not job_data:
                logger.warning(f"Job {job_id} not found by route handler")
                return jsonify({"error": "Job not found"}), 404
            return jsonify(job_data)

        except ConnectionError as ce:  # Catch specific speech service connection errors
            logger.error(f"Speech service connection error for job {job_id}: {str(ce)}")
            return jsonify({"error": "Service temporarily unavailable while fetching speech token"}), 503

        except Exception as e:
            logger.error(f"Error retrieving job {job_id}: {str(e)}")
            return jsonify({"error": "Internal server error retrieving job"}), 500
