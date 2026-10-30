from flask import Flask, jsonify
from app.config import config_by_name
from app.extensions import db, jwt, migrate, cors, bcrypt
from app.routes import register_blueprints
from app.utils.helpers import error_response


def create_app(config_name='default'):
    """Application factory for the HEMORA Blood Bank backend."""
    app = Flask(__name__)

    # Load configuration
    config_obj = config_by_name.get(config_name, config_by_name['default'])
    app.config.from_object(config_obj)

    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)
    migrate.init_app(app, db)
    bcrypt.init_app(app)

    # Configure CORS
    cors.init_app(
        app,
        resources={r"/api/*": {"origins": [app.config.get('FRONTEND_URL', '*'), "*"]}},
        supports_credentials=True
    )

    # Register blueprints
    register_blueprints(app)

    # Register health check endpoint
    @app.route('/api/health', methods=['GET'])
    def health_check():
        return jsonify({
            "status": "healthy",
            "service": "HEMORA Blood Bank API",
            "environment": app.config.get('ENV', 'development')
        }), 200

    @app.route('/', methods=['GET'])
    def root():
        return jsonify({
            "service": "HEMORA Blood Bank API",
            "version": "1.0.0",
            "tagline": "Every Drop Counts. Every Life Matters.",
            "docs": "/api/health"
        }), 200

    # JWT Error handlers to return consistent JSON
    @jwt.unauthorized_loader
    def unauthorized_callback(callback):
        return error_response(message="Missing Authorization Header", errors=[callback], status_code=401)

    @jwt.invalid_token_loader
    def invalid_token_callback(callback):
        return error_response(message="Signature verification failed or token invalid", errors=[callback], status_code=401)

    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return error_response(message="Token has expired. Please refresh or login again.", errors=["Token expired"], status_code=401)

    @jwt.revoked_token_loader
    def revoked_token_callback(jwt_header, jwt_payload):
        return error_response(message="Token has been revoked", errors=["Token revoked"], status_code=401)

    # Global HTTP error handlers
    @app.errorhandler(400)
    def bad_request(error):
        return error_response(message="Bad request", errors=[str(error.description if hasattr(error, 'description') else error)], status_code=400)

    @app.errorhandler(401)
    def unauthorized(error):
        return error_response(message="Unauthorized access", errors=[str(error.description if hasattr(error, 'description') else error)], status_code=401)

    @app.errorhandler(403)
    def forbidden(error):
        return error_response(message="Forbidden: access denied", errors=[str(error.description if hasattr(error, 'description') else error)], status_code=403)

    @app.errorhandler(404)
    def not_found(error):
        return error_response(message="Resource not found", errors=["The requested URL was not found on this server"], status_code=404)

    @app.errorhandler(405)
    def method_not_allowed(error):
        return error_response(message="Method not allowed", errors=[f"Method {error.description if hasattr(error, 'description') else ''} not allowed for this endpoint"], status_code=405)

    @app.errorhandler(500)
    def internal_server_error(error):
        return error_response(message="Internal server error", errors=["An unexpected error occurred. Please try again later."], status_code=500)

    return app
