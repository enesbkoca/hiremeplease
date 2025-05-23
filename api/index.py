from flask import Flask

from api.routes.analysis_routes import register_analysis_routes
from api.routes.home_routes import register_home_routes
from api.routes.job_routes import register_job_routes

app = Flask(__name__)

register_home_routes(app)
register_analysis_routes(app)
register_job_routes(app)

if __name__ == '__main__':
    app.run(debug=True)
