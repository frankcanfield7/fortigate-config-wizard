# CLAUDE.md - Instructions for Claude Code

## 🎯 Project Mission

Transform the FortiGate Spartan Configuration Wizard into a production-ready, full-stack web application with:
- User authentication and multi-user support
- Backend persistence for saving and managing configurations
- Advanced export capabilities (CLI scripts, JSON, YAML, documentation)
- Version control for configuration changes
- Team collaboration features
- Enterprise-grade security and audit logging

## 🏗️ Architecture

This is a **full-stack application** with:
- **Frontend:** React + TypeScript + Tailwind CSS
- **Backend:** Flask + SQLAlchemy + SQLite/PostgreSQL
- **Authentication:** JWT tokens
- **Deployment:** Docker containers

## 📐 Design Principles

1. **Preserve the Original Design**
   - Keep the dark theme with cyan accent colors (#06b6d4, #22d3ee)
   - Maintain the existing UI/UX flow
   - Keep the "Fortinet Spartan" branding and aesthetic
   - Use the same form layouts and output displays

2. **Code Quality**
   - Write clean, well-documented code
   - Use TypeScript for type safety
   - Follow React best practices (hooks, functional components)
   - Implement proper error handling
   - Add comprehensive logging

3. **Security First**
   - Validate all inputs (frontend AND backend)
   - Use JWT for authentication with httpOnly cookies
   - Hash passwords with bcrypt
   - Sanitize user inputs to prevent injection attacks
   - Implement rate limiting on sensitive endpoints

4. **User Experience**
   - Add loading states for async operations
   - Show clear error messages
   - Provide success feedback
   - Make forms easy to use with validation hints
   - Enable autosave for forms (optional)

## 🚀 Development Phases

### Phase 1: Project Setup & Backend Foundation

**Goal:** Create the backend API with database, authentication, and basic CRUD operations.

**Steps:**
1. Set up project structure:
   ```
   fortigate-wizard/
   ├── frontend/
   ├── backend/
   ├── docker/
   └── CLAUDE.md (this file)
   ```

2. Create Flask backend:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # or venv\Scripts\activate on Windows
   pip install flask flask-sqlalchemy flask-jwt-extended flask-cors flask-migrate marshmallow bcrypt
   ```

3. Implement database models:
   - User model (id, username, email, password_hash, created_at, updated_at)
   - Configuration model (id, user_id, config_type, name, description, data_json, tags, is_template, created_at, updated_at)
   - ConfigurationVersion model (for version history)
   - AuditLog model (for tracking changes)

4. Create API routes:
   - `/api/auth/*` - Authentication endpoints
   - `/api/configs/*` - Configuration CRUD
   - `/api/export/*` - Export endpoints
   - `/api/templates/*` - Template management

5. Add authentication middleware:
   - JWT token generation on login
   - JWT verification on protected routes
   - Refresh token mechanism

6. Implement configuration validation:
   - Validate IP addresses and subnets
   - Check for required fields
   - Ensure data types are correct

**Testing Phase 1:**
- Test all API endpoints with curl or Postman
- Verify authentication flow
- Test CRUD operations
- Ensure proper error handling

### Phase 2: Frontend Development

**Goal:** Build the React frontend that consumes the backend API.

**Steps:**
1. Initialize React app with TypeScript:
   ```bash
   cd frontend
   npx create-react-app . --template typescript
   npm install axios react-router-dom tailwindcss
   ```

2. Set up Tailwind CSS with the cyan theme:
   ```javascript
   // tailwind.config.js
   module.exports = {
     theme: {
       extend: {
         colors: {
           'spartan-cyan': {
             light: '#22d3ee',
             DEFAULT: '#06b6d4',
             dark: '#0891b2'
           }
         }
       }
     }
   }
   ```

3. Create component structure:
   - `components/auth/` - Login, Register
   - `components/wizard/` - Configuration forms
   - `components/library/` - Saved configurations browser
   - `components/output/` - CLI/GUI/Script display
   - `components/common/` - Reusable components

4. Implement state management:
   - Create AuthContext for user authentication state
   - Create ConfigContext for current configuration state
   - Use React Query or SWR for API data fetching

5. Convert the existing HTML forms to React components:
   - Extract each form section (IPsec, SD-WAN, etc.) into separate components
   - Use controlled components with React Hook Form
   - Add real-time validation with Zod or Yup

6. Implement the configuration library:
   - Grid/list view of saved configurations
   - Search and filter functionality
   - Quick actions (edit, delete, duplicate, export)

7. Add authentication flow:
   - Login page
   - Register page
   - Protected routes
   - Auto-redirect if not authenticated

**Testing Phase 2:**
- Test all forms with various inputs
- Verify API integration
- Test authentication flow
- Check responsive design on mobile

### Phase 3: Advanced Features

**Goal:** Add version history, templates, sharing, and documentation generation.

**Steps:**
1. Implement version history:
   - Auto-create version on each configuration save
   - Display version timeline
   - Compare versions (diff view)
   - Restore previous versions

2. Add configuration templates:
   - Mark configurations as templates
   - Create new configs from templates
   - Template library with categories

3. Implement sharing:
   - Share configuration with other users
   - Set read/write permissions
   - List shared configurations
   - Revoke sharing

4. Build documentation generator:
   - Use the Fortinet Spartan skill templates
   - Generate Markdown documentation
   - Export to Word/PDF (using docx/pdf skills)
   - Include all sections: Overview, CLI, GUI, Scripts, Validation, Security

5. Add export functionality:
   - Export as CLI script (bash)
   - Export as JSON (for backup/import)
   - Export as YAML (alternative format)
   - Bulk export multiple configurations

6. Implement audit logging:
   - Log all user actions
   - Display audit log (admin only)
   - Filter by user, action, date

**Testing Phase 3:**
- Test version history and restoration
- Verify template functionality
- Test sharing with multiple users
- Generate documentation and verify quality

### Phase 4: Polish & Deployment

**Goal:** Optimize, test, and deploy the application.

**Steps:**
1. Performance optimization:
   - Implement pagination for configuration list
   - Add caching for frequently accessed data
   - Optimize database queries
   - Lazy load components

2. Add comprehensive error handling:
   - Global error boundary in React
   - API error handling with user-friendly messages
   - Retry logic for failed requests
   - Offline mode detection

3. Write tests:
   - Backend: pytest for API endpoints
   - Frontend: Jest + React Testing Library
   - E2E: Playwright or Cypress

4. Create Docker setup:
   - Dockerfile for frontend (Nginx)
   - Dockerfile for backend (Flask)
   - docker-compose.yml for full stack
   - Environment variable configuration

5. Documentation:
   - API documentation (Swagger/OpenAPI)
   - User guide with screenshots
   - Developer setup guide
   - Deployment guide

6. Deploy:
   - Set up CI/CD pipeline (GitHub Actions)
   - Deploy to Docker host
   - Configure HTTPS with Let's Encrypt
   - Set up monitoring and logging

## 💾 Database Schema Details

### Users Table
```python
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    is_active = db.Column(db.Boolean, default=True)
    is_admin = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    configurations = db.relationship('Configuration', backref='owner', lazy=True, cascade='all, delete-orphan')
```

### Configurations Table
```python
class Configuration(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    config_type = db.Column(db.String(50), nullable=False)  # ipsec, sdwan, firewall, etc.
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    data_json = db.Column(db.Text, nullable=False)  # JSON blob of form data
    tags = db.Column(db.String(500))  # Comma-separated tags
    is_template = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    versions = db.relationship('ConfigurationVersion', backref='configuration', lazy=True, cascade='all, delete-orphan')
```

### ConfigurationVersion Table
```python
class ConfigurationVersion(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    config_id = db.Column(db.Integer, db.ForeignKey('configuration.id'), nullable=False)
    version = db.Column(db.Integer, nullable=False)
    data_json = db.Column(db.Text, nullable=False)
    change_description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    created_by = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
```

## 🔧 Configuration Generation Logic

The configuration generation logic from the HTML file should be preserved and enhanced:

1. **Extract the generation functions:**
   - Move the JavaScript generation logic to the backend
   - Create Python functions that generate CLI, GUI, Scripts, and Validation
   - Ensure they produce identical output to the original

2. **Add validation:**
   - Validate IP addresses using ipaddress library
   - Check subnet masks
   - Validate port numbers and protocols
   - Ensure required fields are present

3. **Template system:**
   - Use Jinja2 templates for generating output
   - Store templates in `backend/app/templates/`
   - Make templates customizable per organization

Example backend generation:
```python
def generate_ipsec_config(data):
    """Generate IPsec configuration from form data"""
    
    # Validate inputs
    validate_ip_address(data['local_ip'])
    validate_ip_address(data['remote_ip'])
    validate_subnet(data['local_subnet'])
    validate_subnet(data['remote_subnet'])
    
    # Generate using template
    template = jinja_env.get_template('ipsec_phase1.j2')
    cli_config = template.render(**data)
    
    # Generate GUI steps
    gui_steps = generate_gui_steps('ipsec', data)
    
    # Generate complete script
    script = generate_complete_script('ipsec', data)
    
    # Generate validation commands
    validation = generate_validation('ipsec', data)
    
    return {
        'cli': cli_config,
        'gui': gui_steps,
        'script': script,
        'validation': validation
    }
```

## 🎨 UI/UX Enhancements

While preserving the original design, add these improvements:

1. **Autocomplete:**
   - Interface names (wan1, wan2, lan, etc.)
   - Common IP addresses
   - Standard port numbers

2. **Field validation:**
   - Real-time validation with visual feedback
   - Helpful error messages
   - Suggested corrections

3. **Smart defaults:**
   - Remember user's previous inputs
   - Suggest standard values based on config type
   - Auto-fill related fields

4. **Keyboard shortcuts:**
   - Ctrl+S to save
   - Ctrl+G to generate
   - Ctrl+C to copy output

5. **Quick actions:**
   - One-click duplicate
   - Quick export buttons
   - Fast template creation

## 🔐 Security Checklist

Before deploying, ensure:

- [ ] All passwords are hashed with bcrypt
- [ ] JWT tokens use httpOnly cookies
- [ ] CORS is properly configured
- [ ] Input validation on backend (never trust frontend)
- [ ] SQL injection prevention (using SQLAlchemy ORM)
- [ ] XSS prevention (sanitize user inputs)
- [ ] Rate limiting on auth endpoints
- [ ] HTTPS enforced in production
- [ ] Environment variables for secrets
- [ ] Database backups configured
- [ ] Error messages don't leak sensitive info
- [ ] Audit logging for all actions

## 📊 Monitoring & Logging

Implement proper logging:

```python
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('app.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

# Usage
logger.info(f'User {user.username} created configuration {config.name}')
logger.warning(f'Failed login attempt for user {username}')
logger.error(f'Configuration generation failed: {error}')
```

## 🧪 Testing Requirements

Write tests for:

**Backend:**
- User registration and login
- Configuration CRUD operations
- Version history
- Sharing permissions
- Export functionality
- Input validation

**Frontend:**
- Form submissions
- Configuration generation
- API error handling
- Navigation
- Authentication flow

**E2E:**
- Complete user journey (register → create config → save → export)
- Multi-user scenarios (sharing)
- Mobile responsiveness

## 📝 Environment Variables

Create `.env.example` files:

**Backend:**
```
FLASK_ENV=production
SECRET_KEY=your-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-here
DATABASE_URL=sqlite:///fortigate_wizard.db
CORS_ORIGINS=https://your-domain.com
JWT_ACCESS_TOKEN_EXPIRES=3600
JWT_REFRESH_TOKEN_EXPIRES=2592000
UPLOAD_FOLDER=/tmp/uploads
MAX_CONTENT_LENGTH=16777216
```

**Frontend:**
```
VITE_API_URL=http://localhost:5000
VITE_APP_NAME=FortiGate Spartan Wizard
VITE_VERSION=1.0.0
```

## 🚀 Deployment Checklist

Before going live:

- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] SSL/TLS certificates installed
- [ ] CORS configured for production domain
- [ ] Static files served efficiently (CDN or Nginx)
- [ ] Database backups automated
- [ ] Monitoring and alerts configured
- [ ] Rate limiting enabled
- [ ] Documentation published
- [ ] Admin user created
- [ ] Security headers configured
- [ ] Docker health checks working

## 🎓 Code Style Guidelines

**Python (Backend):**
- Follow PEP 8
- Use type hints
- Document all functions with docstrings
- Keep functions small and focused
- Use meaningful variable names

**TypeScript (Frontend):**
- Use functional components with hooks
- Follow React best practices
- Document complex logic with comments
- Use TypeScript types for everything
- Keep components small and reusable

**Git Workflow:**
- Commit often with clear messages
- Use feature branches
- Write descriptive PR descriptions
- Tag releases with semantic versioning

## 🏛️ Final Notes

Remember the Fortinet Spartan philosophy:

**Precision:** Every detail matters. Configuration errors can cause network outages.

**Excellence:** This tool represents Graphene Networks. Make it enterprise-grade.

**No compromise:** Security, reliability, and usability are non-negotiable.

This is a tool that network engineers will rely on daily. Make it worthy of their trust. ⚔️

---

Good luck, Claude Code! You've got this. 🚀

If you encounter any issues or have questions about the requirements, refer back to this document or ask for clarification.
