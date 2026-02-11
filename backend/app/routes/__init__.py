"""
API routes package.
"""
# Import blueprints here so they can be registered in app/__init__.py
from app.routes import auth, configs

__all__ = ['auth', 'configs']
