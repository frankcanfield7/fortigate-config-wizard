# Initial Prompt for Claude Code

Copy and paste this into Claude Code to get started:

---

# FortiGate Spartan Wizard - Full Stack Development

I have an existing HTML file (fortigate-spartan-wizard.html) that I want to transform into a production-ready full-stack web application.

## What I Need You To Do

Create a complete full-stack application with:

1. **Backend (Flask + SQLAlchemy):**
   - User authentication with JWT tokens
   - RESTful API for configuration CRUD operations
   - SQLite database (with PostgreSQL support for production)
   - Configuration versioning system
   - Export functionality (CLI scripts, JSON, YAML)
   - Comprehensive input validation
   - Audit logging

2. **Frontend (React + TypeScript):**
   - Convert the existing HTML to React components
   - Maintain the exact same UI/UX and cyan theme (#06b6d4, #22d3ee)
   - Add configuration library (browse saved configs)
   - Implement authentication flow (login/register)
   - Connect to backend API
   - Add loading states and error handling

3. **Features:**
   - Save and load configurations
   - Version history with restore capability
   - Configuration templates
   - Team sharing functionality
   - Documentation generation
   - Bulk export

## Important Requirements

- **Preserve the design:** Keep the dark theme, cyan colors, and existing form layouts
- **FortiOS 7.4.0+ syntax:** All generated configurations must use current syntax
- **Security first:** Input validation, password hashing, JWT auth, rate limiting
- **Documentation:** Include README, API docs, and deployment guide
- **Testing:** Write tests for critical functionality
- **Docker:** Include Dockerfile and docker-compose.yml

## Project Structure I Want

```
fortigate-wizard/
├── frontend/          # React + TypeScript
├── backend/           # Flask + SQLAlchemy
├── docker/            # Docker configs
├── docs/              # Documentation
├── tests/             # Test suites
├── CLAUDE.md          # This file with instructions
├── README.md          # Project overview
└── docker-compose.yml # Full stack deployment
```

## Reference Files

I have these reference files that explain the full requirements:
- `CLAUDE.md` - Detailed development instructions (READ THIS FIRST!)
- `PROJECT_SETUP.md` - Architecture and setup guide
- `README.md` - Project overview

## Phase 1 - Start Here

Begin with the backend:
1. Set up Flask project structure
2. Create database models (User, Configuration, ConfigurationVersion, AuditLog)
3. Implement authentication (register, login, JWT)
4. Create CRUD API endpoints for configurations
5. Add input validation

Once backend is working, move to frontend.

## Key Points

- The existing HTML has all the configuration generation logic in JavaScript - preserve this logic but move it to the backend
- The UI is already perfect - just need to React-ify it
- Database schema is in CLAUDE.md - follow it exactly
- Security is critical - this is for production use
- All generated configs must follow FortiOS 7.4.0+ syntax

## Question for You

Before you start, please:
1. Confirm you've read CLAUDE.md and understand the requirements
2. Suggest the best approach for Phase 1 (backend)
3. Identify any potential challenges or questions

Let's build something amazing! 🏛️⚔️

---

After pasting this, Claude Code will ask questions and start building the application according to the detailed specs in CLAUDE.md.
