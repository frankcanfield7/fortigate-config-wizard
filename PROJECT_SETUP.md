# FortiGate Spartan Wizard - Project Setup Guide

## 🎯 Project Overview

Transform the FortiGate Spartan Configuration Wizard into a full-stack enterprise application with backend persistence, authentication, and advanced documentation generation.

## 📋 Quick Start Prompts for Claude Code

### Phase 1: Project Setup
```
Create a full-stack FortiGate configuration wizard with:
- React frontend (TypeScript)
- Flask backend with SQLite database
- User authentication
- Configuration save/load functionality
- RESTful API

Use the existing HTML file as the design reference. Maintain the cyan theme (#06b6d4, #22d3ee) and dark mode aesthetic.
```

### Phase 2: Backend Development
```
Build the Flask backend with:
- SQLite database for storing configurations
- User authentication (JWT tokens)
- CRUD API endpoints for configurations
- Configuration versioning
- Export endpoints (JSON, YAML, CLI script)
- Configuration validation

Database schema:
- users (id, username, email, password_hash, created_at)
- configurations (id, user_id, config_type, name, data_json, created_at, updated_at)
- configuration_versions (id, config_id, version, data_json, created_at)
```

### Phase 3: Frontend Enhancement
```
Convert the HTML to a modern React app with:
- Component architecture (separate components for each config type)
- State management (Context API or Redux)
- API integration with the Flask backend
- Configuration library (saved configs browser)
- Real-time validation
- Responsive mobile design
- Dark mode theme preserved
```

### Phase 4: Documentation Generation
```
Implement the documentation generator that:
- Uses the Fortinet Spartan skill templates
- Generates Markdown documentation
- Exports to Word/PDF using docx/pdf skills
- Follows Graphene Networks standards
- Includes all sections: CLI, GUI, Scripts, Validation, Security Considerations
```

### Phase 5: Advanced Features
```
Add advanced features:
- Configuration comparison/diff tool
- Bulk configuration generation from CSV
- Configuration templates library
- Team collaboration (share configs)
- Audit log for all changes
- Configuration deployment history
```

## 🏗️ Architecture Overview

```
fortigate-wizard/
├── frontend/                 # React TypeScript app
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── services/        # API service layer
│   │   ├── contexts/        # React contexts
│   │   ├── types/           # TypeScript types
│   │   └── utils/           # Utility functions
│   ├── public/
│   └── package.json
│
├── backend/                  # Flask API
│   ├── app/
│   │   ├── models/          # SQLAlchemy models
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   ├── utils/           # Utilities
│   │   └── __init__.py
│   ├── migrations/          # Database migrations
│   ├── requirements.txt
│   └── config.py
│
├── docs/                     # Documentation
│   ├── API.md
│   ├── DATABASE.md
│   └── DEPLOYMENT.md
│
├── tests/                    # Test suites
│   ├── frontend/
│   └── backend/
│
├── docker/                   # Docker configs
│   ├── Dockerfile.frontend
│   ├── Dockerfile.backend
│   └── docker-compose.yml
│
├── CLAUDE.md                # Instructions for Claude Code
├── README.md
└── .env.example
```

## 🔧 Technology Stack

### Frontend
- **Framework:** React 18 with TypeScript
- **Styling:** Tailwind CSS (preserving cyan theme)
- **State Management:** React Context API or Zustand
- **HTTP Client:** Axios
- **Form Handling:** React Hook Form
- **Validation:** Zod or Yup
- **Routing:** React Router v6

### Backend
- **Framework:** Flask 3.0
- **Database:** SQLite (development), PostgreSQL (production)
- **ORM:** SQLAlchemy
- **Authentication:** Flask-JWT-Extended
- **Validation:** Marshmallow
- **Documentation:** Flask-RESTX (Swagger)
- **Testing:** Pytest

### DevOps
- **Containerization:** Docker & Docker Compose
- **CI/CD:** GitHub Actions
- **Deployment:** Docker containers on Ubuntu server

## 📊 Database Schema

```sql
-- Users table
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(80) UNIQUE NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Configurations table
CREATE TABLE configurations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    config_type VARCHAR(50) NOT NULL, -- ipsec, sdwan, firewall, etc.
    name VARCHAR(255) NOT NULL,
    description TEXT,
    data_json TEXT NOT NULL, -- JSON blob of configuration data
    tags TEXT, -- Comma-separated tags
    is_template BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Configuration versions table
CREATE TABLE configuration_versions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    config_id INTEGER NOT NULL,
    version INTEGER NOT NULL,
    data_json TEXT NOT NULL,
    change_description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER NOT NULL,
    FOREIGN KEY (config_id) REFERENCES configurations(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Audit log table
CREATE TABLE audit_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    action VARCHAR(50) NOT NULL, -- create, update, delete, export, etc.
    resource_type VARCHAR(50) NOT NULL,
    resource_id INTEGER,
    details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Shared configurations table (team collaboration)
CREATE TABLE shared_configurations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    config_id INTEGER NOT NULL,
    shared_by INTEGER NOT NULL,
    shared_with INTEGER NOT NULL,
    permission VARCHAR(20) DEFAULT 'read', -- read, write
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (config_id) REFERENCES configurations(id) ON DELETE CASCADE,
    FOREIGN KEY (shared_by) REFERENCES users(id),
    FOREIGN KEY (shared_with) REFERENCES users(id)
);
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT token
- `POST /api/auth/refresh` - Refresh JWT token
- `POST /api/auth/logout` - Logout (blacklist token)

### Configurations
- `GET /api/configs` - List all configurations (with filters)
- `POST /api/configs` - Create new configuration
- `GET /api/configs/:id` - Get configuration by ID
- `PUT /api/configs/:id` - Update configuration
- `DELETE /api/configs/:id` - Delete configuration
- `POST /api/configs/:id/duplicate` - Duplicate configuration
- `GET /api/configs/:id/versions` - Get configuration version history
- `POST /api/configs/:id/versions/:version/restore` - Restore version

### Export
- `GET /api/configs/:id/export/cli` - Export as CLI script
- `GET /api/configs/:id/export/json` - Export as JSON
- `GET /api/configs/:id/export/yaml` - Export as YAML
- `POST /api/configs/:id/export/documentation` - Generate documentation (MD/DOCX/PDF)

### Templates
- `GET /api/templates` - List configuration templates
- `POST /api/templates` - Create template from config
- `GET /api/templates/:id` - Get template details

### Sharing
- `POST /api/configs/:id/share` - Share configuration with user
- `DELETE /api/configs/:id/share/:userId` - Revoke share
- `GET /api/shared` - List configurations shared with me

### Audit
- `GET /api/audit` - Get audit log (admin only)

## 🎨 UI Components to Build

### Core Components
- `ConfigurationWizard` - Main wizard interface
- `ConfigTypeSelector` - Sidebar navigation
- `IPsecForm` - IPsec configuration form
- `SDWANForm` - SD-WAN configuration form
- `FirewallForm` - Firewall policy form
- `InterfaceForm` - Interface configuration form
- `HAForm` - High Availability form
- `SAMLForm` - SAML/Entra ID form
- `OutputDisplay` - Tabbed output display (CLI/GUI/Script/Validation)

### Library Components
- `ConfigLibrary` - Browse saved configurations
- `ConfigCard` - Configuration preview card
- `ConfigDetail` - Full configuration view
- `VersionHistory` - Version comparison and restoration

### Utility Components
- `Header` - Navigation and user menu
- `Sidebar` - Configuration type selector
- `SearchBar` - Search configurations
- `FilterPanel` - Filter by type, tags, date
- `ExportModal` - Export options dialog
- `ShareModal` - Share configuration dialog
- `ConfirmDialog` - Confirmation dialogs

## 🔒 Security Considerations

1. **Authentication:**
   - JWT tokens with secure httpOnly cookies
   - Password hashing with bcrypt
   - Rate limiting on auth endpoints

2. **Authorization:**
   - User can only access their own configurations
   - Shared configurations have read/write permissions
   - Admin role for audit logs

3. **Input Validation:**
   - Backend validation on all inputs
   - Sanitize user inputs to prevent injection
   - Validate IP addresses, subnets, etc.

4. **API Security:**
   - CORS configuration
   - Request size limits
   - Rate limiting
   - API versioning

## 📦 Deployment Strategy

### Development
```bash
# Frontend
cd frontend && npm run dev

# Backend
cd backend && flask run --debug
```

### Production (Docker)
```bash
docker-compose up -d
```

### Environment Variables
```env
# Backend
FLASK_ENV=production
SECRET_KEY=<random-secret-key>
JWT_SECRET_KEY=<jwt-secret-key>
DATABASE_URL=sqlite:///fortigate_wizard.db
CORS_ORIGINS=https://your-domain.com

# Frontend
VITE_API_URL=https://api.your-domain.com
```

## 🧪 Testing Strategy

### Backend Tests
- Unit tests for models and services
- Integration tests for API endpoints
- Authentication and authorization tests
- Configuration generation validation tests

### Frontend Tests
- Component unit tests (Jest + React Testing Library)
- Integration tests for forms
- E2E tests (Playwright or Cypress)

## 📚 Documentation to Generate

1. **API Documentation** - Swagger/OpenAPI spec
2. **User Guide** - How to use the wizard
3. **Developer Guide** - How to extend/customize
4. **Deployment Guide** - How to deploy to production
5. **Database Schema** - ERD diagrams

## 🚀 Feature Roadmap

### Phase 1 (MVP)
- [ ] User authentication
- [ ] Configuration CRUD operations
- [ ] Basic export (CLI, JSON)
- [ ] Configuration library

### Phase 2
- [ ] Version history
- [ ] Configuration templates
- [ ] Advanced search/filter
- [ ] Bulk operations

### Phase 3
- [ ] Team collaboration (sharing)
- [ ] Documentation generation
- [ ] Audit logging
- [ ] Configuration validation

### Phase 4
- [ ] Configuration comparison/diff
- [ ] Deployment tracking
- [ ] FortiGate API integration
- [ ] Multi-tenancy support

## 🎓 Learning Resources

- Flask Documentation: https://flask.palletsprojects.com/
- React Documentation: https://react.dev/
- SQLAlchemy: https://www.sqlalchemy.org/
- Tailwind CSS: https://tailwindcss.com/
- JWT Authentication: https://jwt.io/

## 📝 Notes for Claude Code

- Preserve the existing UI/UX design and cyan theme
- Follow FortiOS 7.4.0+ syntax requirements
- Use Graphene Networks naming conventions
- Include comprehensive error handling
- Add loading states and user feedback
- Implement proper logging
- Follow REST API best practices
- Write clean, documented code
- Include TypeScript types for everything
- Add comprehensive tests

## 🏛️ Remember

*Precision. Excellence. No compromise.* ⚔️

This is an enterprise-grade tool for network engineers. Quality and reliability are paramount.
