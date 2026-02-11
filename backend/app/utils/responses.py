"""
Standardized API response utilities.
"""
from flask import jsonify


def success_response(data=None, message=None, status_code=200):
    """
    Create a standardized success response.

    Args:
        data: Response data (dict, list, or None)
        message (str, optional): Success message
        status_code (int): HTTP status code

    Returns:
        tuple: (response, status_code)
    """
    response = {
        'success': True
    }

    if message:
        response['message'] = message

    if data is not None:
        response['data'] = data

    return jsonify(response), status_code


def error_response(message, errors=None, status_code=400):
    """
    Create a standardized error response.

    Args:
        message (str): Error message
        errors (dict or list, optional): Detailed error information
        status_code (int): HTTP status code

    Returns:
        tuple: (response, status_code)
    """
    response = {
        'success': False,
        'error': message
    }

    if errors:
        response['errors'] = errors

    return jsonify(response), status_code


def validation_error_response(errors):
    """
    Create a validation error response.

    Args:
        errors (dict): Validation errors by field

    Returns:
        tuple: (response, status_code)
    """
    return error_response(
        message='Validation failed',
        errors=errors,
        status_code=422
    )


def not_found_response(resource='Resource'):
    """
    Create a not found error response.

    Args:
        resource (str): Resource name

    Returns:
        tuple: (response, status_code)
    """
    return error_response(
        message=f'{resource} not found',
        status_code=404
    )


def unauthorized_response(message='Authentication required'):
    """
    Create an unauthorized error response.

    Args:
        message (str): Error message

    Returns:
        tuple: (response, status_code)
    """
    return error_response(
        message=message,
        status_code=401
    )


def forbidden_response(message='Permission denied'):
    """
    Create a forbidden error response.

    Args:
        message (str): Error message

    Returns:
        tuple: (response, status_code)
    """
    return error_response(
        message=message,
        status_code=403
    )


def server_error_response(message='Internal server error'):
    """
    Create a server error response.

    Args:
        message (str): Error message

    Returns:
        tuple: (response, status_code)
    """
    return error_response(
        message=message,
        status_code=500
    )


def paginated_response(items, page, per_page, total):
    """
    Create a paginated response.

    Args:
        items (list): List of items for current page
        page (int): Current page number
        per_page (int): Items per page
        total (int): Total number of items

    Returns:
        tuple: (response, status_code)
    """
    import math

    total_pages = math.ceil(total / per_page) if per_page > 0 else 0

    data = {
        'items': items,
        'pagination': {
            'page': page,
            'per_page': per_page,
            'total': total,
            'total_pages': total_pages,
            'has_next': page < total_pages,
            'has_prev': page > 1
        }
    }

    return success_response(data=data)
