"""
Admin API routes for audit log viewing and system management.
"""
import csv
import io
from flask import Blueprint, request, Response
from app import db
from app.models import AuditLog, User
from app.utils import (
    success_response,
    error_response,
    paginated_response,
    admin_required
)

bp = Blueprint('admin', __name__, url_prefix='/api/admin')


@bp.route('/audit-logs', methods=['GET'])
@admin_required()
def list_audit_logs():
    """
    List audit logs with pagination and filters.

    Query Parameters:
        page (int): Page number (default: 1)
        per_page (int): Items per page (default: 50, max: 100)
        action (str): Filter by action type
        user_id (int): Filter by user ID
        resource_type (str): Filter by resource type

    Returns:
        200: Paginated audit log entries
    """
    page = request.args.get('page', 1, type=int)
    per_page = min(request.args.get('per_page', 50, type=int), 100)
    action_filter = request.args.get('action', '').strip()
    user_id_filter = request.args.get('user_id', type=int)
    resource_type_filter = request.args.get('resource_type', '').strip()

    query = AuditLog.query

    if action_filter:
        query = query.filter_by(action=action_filter)

    if user_id_filter:
        query = query.filter_by(user_id=user_id_filter)

    if resource_type_filter:
        query = query.filter_by(resource_type=resource_type_filter)

    query = query.order_by(AuditLog.created_at.desc())

    pagination = query.paginate(page=page, per_page=per_page, error_out=False)

    items = [log.to_dict() for log in pagination.items]

    return paginated_response(
        items=items,
        page=page,
        per_page=per_page,
        total=pagination.total
    )


@bp.route('/audit-logs/export', methods=['GET'])
@admin_required()
def export_audit_logs():
    """
    Export audit logs as CSV.

    Query Parameters:
        action (str): Filter by action type
        user_id (int): Filter by user ID
        resource_type (str): Filter by resource type

    Returns:
        200: CSV file download
    """
    action_filter = request.args.get('action', '').strip()
    user_id_filter = request.args.get('user_id', type=int)
    resource_type_filter = request.args.get('resource_type', '').strip()

    query = AuditLog.query

    if action_filter:
        query = query.filter_by(action=action_filter)

    if user_id_filter:
        query = query.filter_by(user_id=user_id_filter)

    if resource_type_filter:
        query = query.filter_by(resource_type=resource_type_filter)

    query = query.order_by(AuditLog.created_at.desc())

    # Limit to 10,000 rows for safety
    logs = query.limit(10000).all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(['Timestamp', 'Username', 'Action', 'Resource Type', 'Resource ID', 'Details', 'IP Address'])

    for log in logs:
        writer.writerow([
            log.created_at.isoformat() if log.created_at else '',
            log.user.username if log.user else f'User #{log.user_id}',
            log.action,
            log.resource_type,
            log.resource_id or '',
            str(log.get_details()),
            log.ip_address or '',
        ])

    csv_content = output.getvalue()
    output.close()

    return Response(
        csv_content,
        mimetype='text/csv',
        headers={'Content-Disposition': 'attachment; filename=audit-logs.csv'}
    )
