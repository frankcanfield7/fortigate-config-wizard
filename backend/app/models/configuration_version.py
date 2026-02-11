"""
ConfigurationVersion model for version history tracking.
"""
from datetime import datetime
import json
from app import db


class ConfigurationVersion(db.Model):
    """ConfigurationVersion model for tracking configuration changes."""

    __tablename__ = 'configuration_versions'

    id = db.Column(db.Integer, primary_key=True)
    config_id = db.Column(db.Integer, db.ForeignKey('configurations.id'), nullable=False, index=True)
    version = db.Column(db.Integer, nullable=False)
    data_json = db.Column(db.Text, nullable=False)  # JSON blob of configuration data at this version
    change_description = db.Column(db.Text)  # Description of what changed
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    # Relationship to user who created this version
    creator = db.relationship('User', foreign_keys=[created_by])

    # Unique constraint: each config can only have one entry per version number
    __table_args__ = (
        db.UniqueConstraint('config_id', 'version', name='unique_config_version'),
    )

    def __repr__(self):
        return f'<ConfigurationVersion config_id={self.config_id} v{self.version}>'

    def set_data(self, data_dict):
        """
        Store version data as JSON string.

        Args:
            data_dict (dict): Configuration data dictionary
        """
        self.data_json = json.dumps(data_dict)

    def get_data(self):
        """
        Retrieve version data from JSON string.

        Returns:
            dict: Configuration data dictionary
        """
        try:
            return json.loads(self.data_json) if self.data_json else {}
        except json.JSONDecodeError:
            return {}

    def to_dict(self, include_data=True):
        """
        Convert version object to dictionary for JSON serialization.

        Args:
            include_data (bool): Whether to include full configuration data

        Returns:
            dict: Version information
        """
        data = {
            'id': self.id,
            'config_id': self.config_id,
            'version': self.version,
            'change_description': self.change_description,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'created_by': self.created_by
        }

        if include_data:
            data['data'] = self.get_data()

        return data

    @staticmethod
    def get_next_version_number(config_id):
        """
        Get the next version number for a configuration.

        Args:
            config_id (int): Configuration ID

        Returns:
            int: Next version number
        """
        last_version = db.session.query(db.func.max(ConfigurationVersion.version)).filter_by(
            config_id=config_id
        ).scalar()

        return (last_version or 0) + 1
