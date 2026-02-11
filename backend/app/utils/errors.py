"""
Global error handlers for Flask application.
"""
from flask import jsonify
from werkzeug.exceptions import HTTPException
from sqlalchemy.exc import SQLAlchemyError
from flask_jwt_extended.exceptions import NoAuthorizationError
import logging

logger = logging.getLogger(__name__)


def register_error_handlers(app):
    """
    Register global error handlers for the Flask application.

    Args:
        app: Flask application instance
    """

    @app.errorhandler(400)
    def bad_request_error(error):
        """Handle 400 Bad Request errors."""
        return jsonify({
            'success': False,
            'error': 'Bad Request',
            'message': str(error.description) if hasattr(error, 'description') else 'The request was invalid'
        }), 400

    @app.errorhandler(401)
    def unauthorized_error(error):
        """Handle 401 Unauthorized errors."""
        return jsonify({
            'success': False,
            'error': 'Unauthorized',
            'message': str(error.description) if hasattr(error, 'description') else 'Authentication required'
        }), 401

    @app.errorhandler(403)
    def forbidden_error(error):
        """Handle 403 Forbidden errors."""
        return jsonify({
            'success': False,
            'error': 'Forbidden',
            'message': str(error.description) if hasattr(error, 'description') else 'Permission denied'
        }), 403

    @app.errorhandler(404)
    def not_found_error(error):
        """Handle 404 Not Found errors."""
        return jsonify({
            'success': False,
            'error': 'Not Found',
            'message': str(error.description) if hasattr(error, 'description') else 'Resource not found'
        }), 404

    @app.errorhandler(405)
    def method_not_allowed_error(error):
        """Handle 405 Method Not Allowed errors."""
        return jsonify({
            'success': False,
            'error': 'Method Not Allowed',
            'message': 'The method is not allowed for the requested URL'
        }), 405

    @app.errorhandler(422)
    def unprocessable_entity_error(error):
        """Handle 422 Unprocessable Entity errors."""
        return jsonify({
            'success': False,
            'error': 'Unprocessable Entity',
            'message': str(error.description) if hasattr(error, 'description') else 'Validation failed'
        }), 422

    @app.errorhandler(500)
    def internal_server_error(error):
        """Handle 500 Internal Server errors."""
        logger.error(f'Internal Server Error: {str(error)}', exc_info=True)
        return jsonify({
            'success': False,
            'error': 'Internal Server Error',
            'message': 'An unexpected error occurred. Please try again later.'
        }), 500

    @app.errorhandler(HTTPException)
    def handle_http_exception(error):
        """Handle all other HTTP exceptions."""
        return jsonify({
            'success': False,
            'error': error.name,
            'message': error.description
        }), error.code

    @app.errorhandler(NoAuthorizationError)
    def handle_no_authorization_error(error):
        """Handle JWT NoAuthorizationError."""
        return jsonify({
            'success': False,
            'error': 'Unauthorized',
            'message': 'Missing or invalid authorization token'
        }), 401

    @app.errorhandler(SQLAlchemyError)
    def handle_database_error(error):
        """Handle database errors."""
        logger.error(f'Database Error: {str(error)}', exc_info=True)
        return jsonify({
            'success': False,
            'error': 'Database Error',
            'message': 'A database error occurred. Please try again later.'
        }), 500

    @app.errorhandler(Exception)
    def handle_unexpected_error(error):
        """Handle unexpected errors."""
        logger.error(f'Unexpected Error: {str(error)}', exc_info=True)
        return jsonify({
            'success': False,
            'error': 'Unexpected Error',
            'message': 'An unexpected error occurred. Please try again later.'
        }), 500


def register_jwt_error_handlers(jwt):
    """
    Register JWT-specific error handlers.

    Args:
        jwt: JWTManager instance
    """

    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        """Handle expired JWT tokens."""
        return jsonify({
            'success': False,
            'error': 'Token Expired',
            'message': 'The token has expired. Please login again.'
        }), 401

    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        """Handle invalid JWT tokens."""
        return jsonify({
            'success': False,
            'error': 'Invalid Token',
            'message': 'The token is invalid. Please login again.'
        }), 401

    @jwt.unauthorized_loader
    def unauthorized_callback(error):
        """Handle missing JWT tokens."""
        return jsonify({
            'success': False,
            'error': 'Unauthorized',
            'message': 'Authorization token is required'
        }), 401

    @jwt.needs_fresh_token_loader
    def needs_fresh_token_callback(jwt_header, jwt_payload):
        """Handle requests that need a fresh token."""
        return jsonify({
            'success': False,
            'error': 'Fresh Token Required',
            'message': 'A fresh token is required for this action'
        }), 401

    @jwt.revoked_token_loader
    def revoked_token_callback(jwt_header, jwt_payload):
        """Handle revoked JWT tokens."""
        return jsonify({
            'success': False,
            'error': 'Token Revoked',
            'message': 'The token has been revoked. Please login again.'
        }), 401
