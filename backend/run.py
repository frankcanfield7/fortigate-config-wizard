"""
Application entry point.
"""
import os
from app import create_app
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Get environment from environment variable or default to development
env = os.environ.get('FLASK_ENV', 'development')

# Create Flask application
app = create_app(env)

if __name__ == '__main__':
    # Get port from environment or default to 5000
    port = int(os.environ.get('PORT', 5000))

    # Run the application
    app.run(
        host='0.0.0.0',
        port=port,
        debug=app.config['DEBUG']
    )
