"""
Configuration model for storing FortiGate configurations.
"""
from datetime import datetime
import json
from app import db


class Configuration(db.Model):
    """Configuration model for storing FortiGate configuration data."""

    __tablename__ = 'configurations'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    config_type = db.Column(db.String(50), nullable=False, index=True)  # ipsec, sdwan, firewall, etc.
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    data_json = db.Column(db.Text, nullable=False)  # JSON blob of form data
    tags = db.Column(db.String(500))  # Comma-separated tags
    is_template = db.Column(db.Boolean, default=False, nullable=False, index=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    versions = db.relationship(
        'ConfigurationVersion',
        backref='configuration',
        lazy=True,
        cascade='all, delete-orphan',
        order_by='ConfigurationVersion.version.desc()'
    )

    def __repr__(self):
        return f'<Configuration {self.name} ({self.config_type})>'

    def set_data(self, data_dict):
        """
        Store configuration data as JSON string.

        Args:
            data_dict (dict): Configuration data dictionary
        """
        self.data_json = json.dumps(data_dict)

    def get_data(self):
        """
        Retrieve configuration data from JSON string.

        Returns:
            dict: Configuration data dictionary
        """
        try:
            return json.loads(self.data_json) if self.data_json else {}
        except json.JSONDecodeError:
            return {}

    def get_tags_list(self):
        """
        Get tags as a list.

        Returns:
            list: List of tags
        """
        return [tag.strip() for tag in self.tags.split(',')] if self.tags else []

    def set_tags_list(self, tags_list):
        """
        Set tags from a list.

        Args:
            tags_list (list): List of tags
        """
        self.tags = ','.join(tag.strip() for tag in tags_list if tag.strip())

    def to_dict(self, include_data=True):
        """
        Convert configuration object to dictionary for JSON serialization.

        Args:
            include_data (bool): Whether to include full configuration data

        Returns:
            dict: Configuration information
        """
        data = {
            'id': self.id,
            'user_id': self.user_id,
            'config_type': self.config_type,
            'name': self.name,
            'description': self.description,
            'tags': self.get_tags_list(),
            'is_template': self.is_template,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'version_count': len(self.versions) if self.versions else 0
        }

        if include_data:
            data['data'] = self.get_data()

        return data
