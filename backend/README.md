# FortiGate Spartan Wizard - Backend API

Flask-based REST API for the FortiGate Spartan Configuration Wizard.

## 🚀 Quick Start

### Prerequisites
- Python 3.9 or higher
- pip (Python package manager)
- Virtual environment tool (venv)

### Installation

1. **Create virtual environment:**
```bash
python -m venv venv
```

2. **Activate virtual environment:**
```bash
# On Windows (Command Prompt)
venv\Scripts\activate

# On Windows (PowerShell)
venv\Scripts\Activate.ps1

# On Linux/Mac
source venv/bin/activate
```

3. **Install dependencies:**
```bash
pip install -r requirements.txt
```

4. **Configure environment variables:**
```bash
# Copy the example file
cp ../.env.example ../.env

# Edit .env and set your values (especially SECRET_KEY and JWT_SECRET_KEY)
```

5. **Initialize database:**
```bash
# The database will be created automatically when you run the app
# Database file: fortigate_wizard_dev.db (in backend directory)
```

6. **Run the development server:**
```bash
python run.py
```

The API will be available at: `http://localhost:5000`

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### Register New User
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "john_doe",
  "password": "SecurePass123"
}

Response:
{
  "success": true,
  "data": {
    "user": { ... },
    "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
  }
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <access_token>
```

#### Refresh Token
```http
POST /api/auth/refresh
Authorization: Bearer <refresh_token>
```

### Configuration Endpoints

#### List Configurations
```http
GET /api/configs
Authorization: Bearer <access_token>

Query Parameters:
- page (int): Page number (default: 1)
- per_page (int): Items per page (default: 20)
- config_type (str): Filter by type (ipsec, sdwan, firewall, etc.)
- is_template (bool): Filter by template status
- search (str): Search in name and description
- tags (str): Comma-separated tags
```

#### Create Configuration
```http
POST /api/configs
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "Site-to-Site VPN to AWS",
  "config_type": "ipsec",
  "description": "IPsec VPN tunnel to AWS VPC",
  "data": {
    "phase1_name": "aws-vpn",
    "remote_gateway": "52.12.34.56",
    "local_interface": "wan1",
    "psk": "your-preshared-key",
    ...
  },
  "tags": ["aws", "vpn", "production"],
  "is_template": false
}
```

#### Get Configuration
```http
GET /api/configs/<config_id>
Authorization: Bearer <access_token>
```

#### Update Configuration
```http
PUT /api/configs/<config_id>
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "Updated configuration name",
  "data": { ... },
  "change_description": "Updated remote gateway IP"
}
```

#### Delete Configuration
```http
DELETE /api/configs/<config_id>
Authorization: Bearer <access_token>
```

#### Get Version History
```http
GET /api/configs/<config_id>/versions
Authorization: Bearer <access_token>
```

#### Get Specific Version
```http
GET /api/configs/<config_id>/versions/<version_number>
Authorization: Bearer <access_token>
```

### Health Check
```http
GET /health

Response:
{
  "status": "healthy",
  "version": "1.0.0"
}
```

## 🗄️ Database Models

### User
- `id`: Primary key
- `username`: Unique username
- `email`: Unique email
- `password_hash`: Hashed password (bcrypt)
- `is_active`: Account status
- `is_admin`: Admin flag
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp

### Configuration
- `id`: Primary key
- `user_id`: Foreign key to User
- `config_type`: Configuration type (ipsec, sdwan, firewall, etc.)
- `name`: Configuration name
- `description`: Description
- `data_json`: JSON blob of configuration data
- `tags`: Comma-separated tags
- `is_template`: Template flag
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp

### ConfigurationVersion
- `id`: Primary key
- `config_id`: Foreign key to Configuration
- `version`: Version number
- `data_json`: JSON blob of configuration data at this version
- `change_description`: Description of changes
- `created_at`: Creation timestamp
- `created_by`: Foreign key to User

### AuditLog
- `id`: Primary key
- `user_id`: Foreign key to User
- `action`: Action performed
- `resource_type`: Type of resource
- `resource_id`: Resource ID
- `details`: JSON blob with additional details
- `ip_address`: User's IP address
- `user_agent`: User's user agent
- `created_at`: Timestamp

## 🧪 Testing

### Test with cURL

**Register a user:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"TestPass123"}'
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"TestPass123"}'
```

**Create configuration (replace TOKEN with your access_token):**
```bash
curl -X POST http://localhost:5000/api/configs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "name":"Test VPN",
    "config_type":"ipsec",
    "description":"Test configuration",
    "data":{"phase1_name":"test-vpn","remote_gateway":"1.2.3.4"},
    "tags":["test"]
  }'
```

## 🔒 Security

### Password Requirements
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

### JWT Tokens
- Access token expires: 1 hour
- Refresh token expires: 30 days
- Tokens are signed with JWT_SECRET_KEY

### CORS
- Configured origins in .env CORS_ORIGINS
- Supports credentials for authentication

## 📝 Development

### Project Structure
```
backend/
├── app/
│   ├── __init__.py          # Flask app factory
│   ├── models/              # Database models
│   │   ├── user.py
│   │   ├── configuration.py
│   │   ├── configuration_version.py
│   │   └── audit_log.py
│   ├── routes/              # API routes
│   │   ├── auth.py
│   │   └── configs.py
│   ├── services/            # Business logic (future)
│   └── utils/               # Utilities
│       ├── auth.py          # Auth helpers
│       ├── validators.py    # Input validators
│       ├── responses.py     # Response helpers
│       └── errors.py        # Error handlers
├── migrations/              # Database migrations
├── config.py               # Configuration classes
├── requirements.txt        # Python dependencies
├── run.py                 # Application entry point
└── README.md              # This file
```

### Adding New Endpoints
1. Create route function in appropriate blueprint
2. Add JWT protection with `@jwt_required()`
3. Validate inputs using validators
4. Return standardized responses
5. Log actions in AuditLog

### Database Migrations
```bash
# Initialize migrations (already done)
flask db init

# Create migration after model changes
flask db migrate -m "Description of changes"

# Apply migrations
flask db upgrade

# Rollback migration
flask db downgrade
```

## 🐛 Troubleshooting

### "ModuleNotFoundError"
Make sure virtual environment is activated and dependencies are installed:
```bash
pip install -r requirements.txt
```

### "sqlalchemy.exc.OperationalError"
Database file permissions issue or database doesn't exist. Delete `fortigate_wizard_dev.db` and restart the app.

### CORS Errors
Check that CORS_ORIGINS in .env includes your frontend URL:
```
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

### "401 Unauthorized"
- Check that Authorization header is set: `Bearer <access_token>`
- Token may be expired, use refresh token to get a new one
- Make sure you're using access_token (not refresh_token) for protected routes

## 📦 Production Deployment

See `../docs/DEPLOYMENT.md` for production deployment instructions.

## 🏛️ FortiGate Spartan Philosophy

**Precision. Excellence. No compromise.** ⚔️

This API is built to enterprise standards with:
- Comprehensive error handling
- Audit logging for all actions
- Input validation on all endpoints
- JWT authentication with refresh tokens
- Version history for configurations
- RESTful API design
- Type safety with Python type hints
- Detailed logging for troubleshooting
