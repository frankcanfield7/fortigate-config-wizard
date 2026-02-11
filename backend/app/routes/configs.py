"""
Configuration management API routes.
"""
from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import or_, and_
from app import db
from app.models import Configuration, ConfigurationVersion, AuditLog
from app.utils import (
    success_response,
    error_response,
    validation_error_response,
    not_found_response,
    forbidden_response,
    paginated_response,
    validate_config_type,
    validate_tags,
    get_request_info
)

bp = Blueprint('configs', __name__, url_prefix='/api/configs')


@bp.route('', methods=['GET'])
@jwt_required()
def list_configurations():
    """
    List all configurations for the current user.

    Query Parameters:
        page (int): Page number (default: 1)
        per_page (int): Items per page (default: 20, max: 100)
        config_type (str): Filter by configuration type
        is_template (bool): Filter by template status
        search (str): Search in name and description
        tags (str): Comma-separated tags to filter by

    Returns:
        200: List of configurations with pagination
    """
    user_id = int(get_jwt_identity())  # JWT identity is string, convert to int

    # Pagination parameters
    page = request.args.get('page', 1, type=int)
    per_page = min(request.args.get('per_page', 20, type=int), 100)

    # Filter parameters
    config_type = request.args.get('config_type')
    is_template = request.args.get('is_template', type=lambda v: v.lower() == 'true')
    search = request.args.get('search', '').strip()
    tags = request.args.get('tags', '').strip()

    # Build query
    query = Configuration.query.filter_by(user_id=user_id)

    if config_type:
        query = query.filter_by(config_type=config_type)

    if is_template is not None:
        query = query.filter_by(is_template=is_template)

    if search:
        search_filter = or_(
            Configuration.name.ilike(f'%{search}%'),
            Configuration.description.ilike(f'%{search}%')
        )
        query = query.filter(search_filter)

    if tags:
        # Filter by tags (any tag matches)
        tag_list = [tag.strip() for tag in tags.split(',')]
        tag_filters = [Configuration.tags.ilike(f'%{tag}%') for tag in tag_list]
        query = query.filter(or_(*tag_filters))

    # Order by updated_at descending (most recent first)
    query = query.order_by(Configuration.updated_at.desc())

    # Execute paginated query
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)

    # Convert to dict
    items = [config.to_dict(include_data=False) for config in pagination.items]

    return paginated_response(
        items=items,
        page=page,
        per_page=per_page,
        total=pagination.total
    )


@bp.route('', methods=['POST'])
@jwt_required()
def create_configuration():
    """
    Create a new configuration.

    Request JSON:
        config_type (str): Configuration type (ipsec, sdwan, firewall, etc.)
        name (str): Configuration name (required)
        description (str): Configuration description (optional)
        data (dict): Configuration data
        tags (list): Tags (optional)
        is_template (bool): Mark as template (optional, default: false)

    Returns:
        201: Configuration created successfully
        400: Missing required fields or invalid data
        422: Validation failed
    """
    user_id = int(get_jwt_identity())  # JWT identity is string, convert to int
    data = request.get_json()

    if not data:
        return error_response('No data provided', status_code=400)

    # Check required fields
    if not data.get('name'):
        return error_response('Configuration name is required', status_code=400)

    if not data.get('config_type'):
        return error_response('Configuration type is required', status_code=400)

    if not data.get('data'):
        return error_response('Configuration data is required', status_code=400)

    name = data.get('name', '').strip()
    config_type = data.get('config_type', '').strip()
    description = data.get('description', '').strip()
    config_data = data.get('data', {})
    tags = data.get('tags', [])
    is_template = data.get('is_template', False)

    # Validate inputs
    errors = {}

    config_type_valid, config_type_error = validate_config_type(config_type)
    if not config_type_valid:
        errors['config_type'] = config_type_error

    tags_valid, tags_error = validate_tags(tags)
    if not tags_valid:
        errors['tags'] = tags_error

    if errors:
        return validation_error_response(errors)

    # Create configuration
    config = Configuration(
        user_id=user_id,
        config_type=config_type,
        name=name,
        description=description,
        is_template=is_template
    )

    config.set_data(config_data)

    if tags:
        if isinstance(tags, list):
            config.set_tags_list(tags)
        else:
            config.tags = tags

    db.session.add(config)
    db.session.flush()  # Flush to get config.id

    # Create initial version
    version = ConfigurationVersion(
        config_id=config.id,
        version=1,
        change_description='Initial version',
        created_by=user_id
    )
    version.set_data(config_data)
    db.session.add(version)

    db.session.commit()

    # Log the creation
    request_info = get_request_info()
    AuditLog.log(
        user_id=user_id,
        action='create',
        resource_type='configuration',
        resource_id=config.id,
        details={'name': name, 'config_type': config_type},
        **request_info
    )

    return success_response(
        data=config.to_dict(),
        message='Configuration created successfully',
        status_code=201
    )


@bp.route('/<int:config_id>', methods=['GET'])
@jwt_required()
def get_configuration(config_id):
    """
    Get a specific configuration.

    Args:
        config_id (int): Configuration ID

    Returns:
        200: Configuration data
        404: Configuration not found
        403: Permission denied
    """
    user_id = int(get_jwt_identity())  # JWT identity is string, convert to int

    config = db.session.get(Configuration, config_id)

    if not config:
        return not_found_response('Configuration')

    # Check ownership
    if config.user_id != user_id:
        return forbidden_response('You do not have permission to access this configuration')

    return success_response(data=config.to_dict())


@bp.route('/<int:config_id>', methods=['PUT'])
@jwt_required()
def update_configuration(config_id):
    """
    Update a configuration.

    Args:
        config_id (int): Configuration ID

    Request JSON:
        name (str): Configuration name (optional)
        description (str): Configuration description (optional)
        data (dict): Configuration data (optional)
        tags (list): Tags (optional)
        is_template (bool): Template status (optional)
        change_description (str): Description of changes (optional)

    Returns:
        200: Configuration updated successfully
        404: Configuration not found
        403: Permission denied
        422: Validation failed
    """
    user_id = int(get_jwt_identity())  # JWT identity is string, convert to int
    data = request.get_json()

    if not data:
        return error_response('No data provided', status_code=400)

    config = db.session.get(Configuration, config_id)

    if not config:
        return not_found_response('Configuration')

    # Check ownership
    if config.user_id != user_id:
        return forbidden_response('You do not have permission to modify this configuration')

    # Track if data has changed (for versioning)
    data_changed = False

    # Update fields
    if 'name' in data:
        config.name = data['name'].strip()

    if 'description' in data:
        config.description = data['description'].strip()

    if 'tags' in data:
        tags = data['tags']
        tags_valid, tags_error = validate_tags(tags)
        if not tags_valid:
            return validation_error_response({'tags': tags_error})

        if isinstance(tags, list):
            config.set_tags_list(tags)
        else:
            config.tags = tags

    if 'is_template' in data:
        config.is_template = data['is_template']

    if 'data' in data:
        config.set_data(data['data'])
        data_changed = True

    # Create new version if data changed
    if data_changed:
        next_version = ConfigurationVersion.get_next_version_number(config_id)
        version = ConfigurationVersion(
            config_id=config_id,
            version=next_version,
            change_description=data.get('change_description', 'Configuration updated'),
            created_by=user_id
        )
        version.set_data(data['data'])
        db.session.add(version)

    db.session.commit()

    # Log the update
    request_info = get_request_info()
    AuditLog.log(
        user_id=user_id,
        action='update',
        resource_type='configuration',
        resource_id=config_id,
        details={'name': config.name, 'data_changed': data_changed},
        **request_info
    )

    return success_response(
        data=config.to_dict(),
        message='Configuration updated successfully'
    )


@bp.route('/<int:config_id>', methods=['DELETE'])
@jwt_required()
def delete_configuration(config_id):
    """
    Delete a configuration.

    Args:
        config_id (int): Configuration ID

    Returns:
        200: Configuration deleted successfully
        404: Configuration not found
        403: Permission denied
    """
    user_id = int(get_jwt_identity())  # JWT identity is string, convert to int

    config = db.session.get(Configuration, config_id)

    if not config:
        return not_found_response('Configuration')

    # Check ownership
    if config.user_id != user_id:
        return forbidden_response('You do not have permission to delete this configuration')

    config_name = config.name

    # Delete configuration (cascade will delete versions)
    db.session.delete(config)
    db.session.commit()

    # Log the deletion
    request_info = get_request_info()
    AuditLog.log(
        user_id=user_id,
        action='delete',
        resource_type='configuration',
        resource_id=config_id,
        details={'name': config_name},
        **request_info
    )

    return success_response(message='Configuration deleted successfully')


@bp.route('/<int:config_id>/versions', methods=['GET'])
@jwt_required()
def get_configuration_versions(config_id):
    """
    Get version history for a configuration.

    Args:
        config_id (int): Configuration ID

    Returns:
        200: List of versions
        404: Configuration not found
        403: Permission denied
    """
    user_id = int(get_jwt_identity())  # JWT identity is string, convert to int

    config = db.session.get(Configuration, config_id)

    if not config:
        return not_found_response('Configuration')

    # Check ownership
    if config.user_id != user_id:
        return forbidden_response('You do not have permission to access this configuration')

    versions = [version.to_dict(include_data=False) for version in config.versions]

    return success_response(data={'versions': versions})


@bp.route('/<int:config_id>/versions/<int:version_number>', methods=['GET'])
@jwt_required()
def get_configuration_version(config_id, version_number):
    """
    Get a specific version of a configuration.

    Args:
        config_id (int): Configuration ID
        version_number (int): Version number

    Returns:
        200: Version data
        404: Configuration or version not found
        403: Permission denied
    """
    user_id = int(get_jwt_identity())  # JWT identity is string, convert to int

    config = db.session.get(Configuration, config_id)

    if not config:
        return not_found_response('Configuration')

    # Check ownership
    if config.user_id != user_id:
        return forbidden_response('You do not have permission to access this configuration')

    version = ConfigurationVersion.query.filter_by(
        config_id=config_id,
        version=version_number
    ).first()

    if not version:
        return not_found_response('Version')

    return success_response(data=version.to_dict())
