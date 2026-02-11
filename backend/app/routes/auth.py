"""
Authentication API routes.
"""
from flask import Blueprint, request
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    jwt_required,
    get_jwt_identity
)
from app import db
from app.models import User, AuditLog
from app.utils import (
    success_response,
    error_response,
    validation_error_response,
    validate_username,
    validate_email,
    validate_password,
    get_request_info
)

bp = Blueprint('auth', __name__, url_prefix='/api/auth')


@bp.route('/register', methods=['POST'])
def register():
    """
    Register a new user.

    Request JSON:
        username (str): Username (3-80 characters, alphanumeric + _ -)
        email (str): Valid email address
        password (str): Password (min 8 chars, must include uppercase, lowercase, number)

    Returns:
        201: User created successfully with user data
        400: Missing required fields
        422: Validation failed
        409: Username or email already exists
    """
    data = request.get_json()

    if not data:
        return error_response('No data provided', status_code=400)

    # Check required fields
    required_fields = ['username', 'email', 'password']
    missing_fields = [field for field in required_fields if not data.get(field)]

    if missing_fields:
        return error_response(
            f"Missing required fields: {', '.join(missing_fields)}",
            status_code=400
        )

    username = data.get('username', '').strip()
    email = data.get('email', '').strip().lower()
    password = data.get('password')

    # Validate inputs
    errors = {}

    username_valid, username_error = validate_username(username)
    if not username_valid:
        errors['username'] = username_error

    email_valid, email_error = validate_email(email)
    if not email_valid:
        errors['email'] = email_error

    password_valid, password_error = validate_password(password)
    if not password_valid:
        errors['password'] = password_error

    if errors:
        return validation_error_response(errors)

    # Check if username or email already exists
    existing_user = User.query.filter(
        (User.username == username) | (User.email == email)
    ).first()

    if existing_user:
        if existing_user.username == username:
            return error_response('Username already exists', status_code=409)
        else:
            return error_response('Email already exists', status_code=409)

    # Create new user
    user = User(username=username, email=email)
    user.set_password(password)

    db.session.add(user)
    db.session.commit()

    # Log the registration
    request_info = get_request_info()
    AuditLog.log(
        user_id=user.id,
        action='register',
        resource_type='user',
        resource_id=user.id,
        **request_info
    )

    return success_response(
        data=user.to_dict(include_email=True),
        message='User registered successfully',
        status_code=201
    )


@bp.route('/login', methods=['POST'])
def login():
    """
    Login and get JWT tokens.

    Request JSON:
        username (str): Username or email
        password (str): Password

    Returns:
        200: Login successful with access and refresh tokens
        400: Missing required fields
        401: Invalid credentials or account inactive
    """
    data = request.get_json()

    if not data:
        return error_response('No data provided', status_code=400)

    username_or_email = data.get('username', '').strip()
    password = data.get('password')

    if not username_or_email or not password:
        return error_response('Username and password are required', status_code=400)

    # Find user by username or email
    user = User.query.filter(
        (User.username == username_or_email) | (User.email == username_or_email.lower())
    ).first()

    if not user or not user.check_password(password):
        # Log failed login attempt
        if user:
            request_info = get_request_info()
            AuditLog.log(
                user_id=user.id,
                action='login_failed',
                resource_type='user',
                resource_id=user.id,
                details={'reason': 'invalid_password'},
                **request_info
            )

        return error_response('Invalid username or password', status_code=401)

    if not user.is_active:
        return error_response('Account is inactive', status_code=401)

    # Create JWT tokens (identity must be string)
    access_token = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))

    # Log successful login
    request_info = get_request_info()
    AuditLog.log(
        user_id=user.id,
        action='login',
        resource_type='user',
        resource_id=user.id,
        **request_info
    )

    return success_response(
        data={
            'user': user.to_dict(include_email=True),
            'access_token': access_token,
            'refresh_token': refresh_token
        },
        message='Login successful'
    )


@bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    """
    Refresh access token using refresh token.

    Headers:
        Authorization: Bearer <refresh_token>

    Returns:
        200: New access token
        401: Invalid or expired refresh token
    """
    user_id_str = get_jwt_identity()  # JWT identity is string
    user_id = int(user_id_str)  # Convert to int for database lookup
    user = db.session.get(User, user_id)

    if not user or not user.is_active:
        return error_response('Invalid or inactive user', status_code=401)

    # Create new access token (identity must be string)
    access_token = create_access_token(identity=user_id_str)

    return success_response(
        data={'access_token': access_token},
        message='Token refreshed successfully'
    )


@bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """
    Get current authenticated user information.

    Headers:
        Authorization: Bearer <access_token>

    Returns:
        200: Current user data
        401: Invalid or expired token
        404: User not found
    """
    user_id_str = get_jwt_identity()  # JWT identity is string
    user_id = int(user_id_str)  # Convert to int for database lookup
    user = db.session.get(User, user_id)

    if not user:
        return error_response('User not found', status_code=404)

    return success_response(data=user.to_dict(include_email=True))


@bp.route('/debug-token', methods=['GET'])
@jwt_required()
def debug_token():
    """Debug endpoint to test JWT validation."""
    user_id = get_jwt_identity()
    return success_response(data={'user_id': user_id, 'message': 'Token is valid!'})


@bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    """
    Logout user (placeholder for token blacklisting).

    Headers:
        Authorization: Bearer <access_token>

    Returns:
        200: Logout successful
    """
    user_id_str = get_jwt_identity()  # JWT identity is string
    user_id = int(user_id_str)  # Convert to int

    # Log the logout
    request_info = get_request_info()
    AuditLog.log(
        user_id=user_id,
        action='logout',
        resource_type='user',
        resource_id=user_id,
        **request_info
    )

    # TODO: Implement token blacklisting in future phase
    # For now, client should just discard the token

    return success_response(message='Logout successful')
