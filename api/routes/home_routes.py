from api.utils.logger_config import logger


def register_home_routes(app):
    logger.debug("Registering home routes")

    @app.route('/api')
    def index():
        logger.debug("API index route accessed")
        return "<p>Welcome to the API!</p>"
