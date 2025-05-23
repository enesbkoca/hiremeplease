from flask import Flask, jsonify

from api.utils.rate_limiter import limiter
from api.utils.authentication import auth_context_processor
from api.routes.analysis_routes import register_analysis_routes
from api.routes.home_routes import register_home_routes
from api.routes.job_routes import register_job_routes


app = Flask(__name__)

limiter.init_app(app)

app.before_request(auth_context_processor)

register_home_routes(app)
register_analysis_routes(app)
register_job_routes(app)


@app.errorhandler(429)
def ratelimit_handler(e):
    return jsonify(error="Rate limit exceeded", description=str(e.description)), 429


if __name__ == '__main__':
    app.run(debug=True)
