"""Application factory and HTTP entry point for SasyaVedha."""
from flask import Flask
from flask_cors import CORS

import database as db
from auth_routes import auth_bp
from farm_routes import farm_bp


def create_app():
    app = Flask(__name__)
    CORS(app)
    db.init_db()
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(farm_bp, url_prefix='/api')
    return app


app = create_app()


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
