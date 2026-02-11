"""
AuditLog model for tracking user actions and system events.
"""
from datetime import datetime
import json
from app import db


class AuditLog(db.Model):
    """AuditLog model for tracking all user actions."""

    __tablename__ = 'audit_log'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    action = db.Column(db.String(50), nullable=False, index=True)  # create, update, delete, export, login, etc.
    resource_type = db.Column(db.String(50), nullable=False)  # configuration, user, template, etc.
    resource_id = db.Column(db.Integer)  # ID of the affected resource
    details = db.Column(db.Text)  # JSON blob with additional details
    ip_address = db.Column(db.String(45))  # IPv4 or IPv6 address
    user_agent = db.Column(db.String(255))  # Browser/client user agent
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False, index=True)

    # Relationship to user
    user = db.relationship('User', foreign_keys=[user_id])

    def __repr__(self):
        return f'<AuditLog {self.action} {self.resource_type} by user_id={self.user_id}>'

    def set_details(self, details_dict):
        """
        Store details as JSON string.

        Args:
            details_dict (dict): Details dictionary
        """
        self.details = json.dumps(details_dict)

    def get_details(self):
        """
        Retrieve details from JSON string.

        Returns:
            dict: Details dictionary
        """
        try:
            return json.loads(self.details) if self.details else {}
        except json.JSONDecodeError:
            return {}

    def to_dict(self):
        """
        Convert audit log entry to dictionary for JSON serialization.

        Returns:
            dict: Audit log information
        """
        return {
            'id': self.id,
            'user_id': self.user_id,
            'username': self.user.username if self.user else None,
            'action': self.action,
            'resource_type': self.resource_type,
            'resource_id': self.resource_id,
            'details': self.get_details(),
            'ip_address': self.ip_address,
            'user_agent': self.user_agent,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

    @staticmethod
    def log(user_id, action, resource_type, resource_id=None, details=None, ip_address=None, user_agent=None):
        """
        Create an audit log entry.

        Args:
            user_id (int): User ID
            action (str): Action performed
            resource_type (str): Type of resource affected
            resource_id (int, optional): ID of affected resource
            details (dict, optional): Additional details
            ip_address (str, optional): User's IP address
            user_agent (str, optional): User's user agent string

        Returns:
            AuditLog: Created audit log entry
        """
        log_entry = AuditLog(
            user_id=user_id,
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            ip_address=ip_address,
            user_agent=user_agent
        )

        if details:
            log_entry.set_details(details)

        db.session.add(log_entry)
        db.session.commit()

        return log_entry
