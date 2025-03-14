from flask import Flask

from api.utils.logger_config import get_logger
from api.jobs.routes import jobs_bp
from api.analyses.routes import analyses_bp

logger = get_logger()

app = Flask(__name__)
app.register_blueprint(jobs_bp, url_prefix='/jobs')
app.register_blueprint(analyses_bp, url_prefix='/analyses')


@app.route('/api')
def index():
    logger.debug("API entry endpoint called")
    return "<p>Welcome to the API!</p>"


if __name__ == '__main__':
    app.run(debug=True)