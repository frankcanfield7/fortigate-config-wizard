"""
Authentication utilities and decorators.
"""
from functools import wraps
from flask import jsonify, request
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity, get_jwt
from app import db
from app.models import User


def admin_required():
    """
    Decorator to require admin privileges for a route.
    Must be used after @jwt_required()
    """
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            verify_jwt_in_request()
            user_id = int(get_jwt_identity())  # JWT identity is string, convert to int
            user = db.session.get(User, user_id)

            if not user or not user.is_admin:
                return jsonify({
                    'error': 'Admin privileges required',
                    'message': 'You do not have permission to access this resource'
                }), 403

            return fn(*args, **kwargs)
        return decorator
    return wrapper


def get_current_user():
    """
    Get the current authenticated user from JWT token.

    Returns:
        User: Current user object or None if not authenticated
    """
    try:
        verify_jwt_in_request(optional=True)
        user_id_str = get_jwt_identity()

        if user_id_str:
            user_id = int(user_id_str)  # JWT identity is string, convert to int
            return db.session.get(User, user_id)
    except Exception:
        pass

    return None


def get_current_user_id():
    """
    Get the current authenticated user ID from JWT token.

    Returns:
        int: Current user ID or None if not authenticated
    """
    try:
        verify_jwt_in_request()
        user_id_str = get_jwt_identity()
        return int(user_id_str) if user_id_str else None  # Convert string to int
    except Exception:
        return None


def validate_password(password):
    """
    Validate password strength.

    Args:
        password (str): Password to validate

    Returns:
        tuple: (is_valid, error_message)
    """
    if len(password) < 8:
        return False, "Password must be at least 8 characters long"

    if not any(char.isdigit() for char in password):
        return False, "Password must contain at least one number"

    if not any(char.isupper() for char in password):
        return False, "Password must contain at least one uppercase letter"

    if not any(char.islower() for char in password):
        return False, "Password must contain at least one lowercase letter"

    return True, None


def validate_username(username):
    """
    Validate username format.

    Args:
        username (str): Username to validate

    Returns:
        tuple: (is_valid, error_message)
    """
    if len(username) < 3:
        return False, "Username must be at least 3 characters long"

    if len(username) > 80:
        return False, "Username must be less than 80 characters"

    if not username.replace('_', '').replace('-', '').isalnum():
        return False, "Username can only contain letters, numbers, hyphens, and underscores"

    return True, None


def validate_email(email):
    """
    Validate email format.

    Args:
        email (str): Email to validate

    Returns:
        tuple: (is_valid, error_message)
    """
    import re

    email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'

    if not re.match(email_regex, email):
        return False, "Invalid email format"

    return True, None


def get_request_info():
    """
    Get information about the current request for audit logging.

    Returns:
        dict: Request information (IP address, user agent)
    """
    return {
        'ip_address': request.remote_addr,
        'user_agent': request.headers.get('User-Agent', '')
    }
