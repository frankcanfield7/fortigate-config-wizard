"""
Template management API routes.
"""
from flask import Blueprint
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import Configuration, ConfigurationVersion, AuditLog
from app.utils import (
    success_response,
    error_response,
    not_found_response,
    forbidden_response,
    get_request_info
)

bp = Blueprint('templates', __name__, url_prefix='/api/templates')


@bp.route('', methods=['GET'])
@jwt_required()
def list_templates():
    """
    List all templates (configurations marked as templates).

    Returns:
        200: List of template configurations
    """
    templates = Configuration.query.filter_by(is_template=True).order_by(
        Configuration.updated_at.desc()
    ).all()

    return success_response(
        data=[t.to_dict(include_data=False) for t in templates]
    )


@bp.route('/<int:template_id>/create', methods=['POST'])
@jwt_required()
def create_from_template(template_id):
    """
    Create a new configuration from a template.

    Args:
        template_id (int): Template configuration ID

    Returns:
        201: New configuration created from template
        404: Template not found
    """
    user_id = int(get_jwt_identity())

    template = db.session.get(Configuration, template_id)

    if not template:
        return not_found_response('Template')

    if not template.is_template:
        return error_response('This configuration is not a template', status_code=400)

    # Create new config from template
    new_config = Configuration(
        user_id=user_id,
        config_type=template.config_type,
        name=f'{template.name} - New',
        description=f'Created from template: {template.name}',
        is_template=False
    )
    new_config.set_data(template.get_data())

    if template.tags:
        new_config.tags = template.tags

    db.session.add(new_config)
    db.session.flush()

    # Create initial version
    version = ConfigurationVersion(
        config_id=new_config.id,
        version=1,
        change_description=f'Created from template "{template.name}"',
        created_by=user_id
    )
    version.set_data(template.get_data())
    db.session.add(version)

    db.session.commit()

    # Log
    request_info = get_request_info()
    AuditLog.log(
        user_id=user_id,
        action='create_from_template',
        resource_type='configuration',
        resource_id=new_config.id,
        details={'template_id': template_id, 'template_name': template.name},
        **request_info
    )

    return success_response(
        data=new_config.to_dict(),
        message='Configuration created from template',
        status_code=201
    )
