# 🚀 Quick Start Cheat Sheet for Claude Code

## Essential Commands

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install flask flask-sqlalchemy flask-jwt-extended flask-cors flask-migrate marshmallow bcrypt pytest
flask db init
flask db migrate -m "Initial migration"
flask db upgrade
flask run --debug
```

### Frontend Setup
```bash
cd frontend
npx create-react-app . --template typescript
npm install axios react-router-dom @tanstack/react-query
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npm run dev
```

### Docker Commands
```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Restart a service
docker-compose restart backend

# Stop all services
docker-compose down

# Rebuild after code changes
docker-compose up -d --build
```

## File Structure Quick Reference

```
fortigate-wizard/
├── backend/
│   ├── app/
│   │   ├── __init__.py           # Flask app factory
│   │   ├── models/
│   │   │   ├── user.py           # User model
│   │   │   ├── configuration.py  # Configuration model
│   │   │   └── audit_log.py      # Audit log model
│   │   ├── routes/
│   │   │   ├── auth.py           # Authentication routes
│   │   │   ├── configs.py        # Configuration CRUD
│   │   │   └── export.py         # Export routes
│   │   ├── services/
│   │   │   ├── config_generator.py  # Config generation logic
│   │   │   └── validator.py      # Input validation
│   │   └── utils/
│   │       ├── decorators.py     # Custom decorators
│   │       └── helpers.py        # Helper functions
│   ├── migrations/               # Database migrations
│   ├── tests/                    # Backend tests
│   ├── requirements.txt          # Python dependencies
│   ├── config.py                 # Configuration classes
│   └── run.py                    # Application entry point
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── auth/             # Login, Register
    │   │   ├── wizard/           # Configuration forms
    │   │   ├── library/          # Config library
    │   │   └── common/           # Shared components
    │   ├── contexts/
    │   │   ├── AuthContext.tsx   # Authentication state
    │   │   └── ConfigContext.tsx # Configuration state
    │   ├── services/
    │   │   └── api.ts            # API client
    │   ├── types/
    │   │   └── index.ts          # TypeScript types
    │   └── App.tsx               # Main app component
    └── package.json              # npm dependencies
```

## Key Files to Create First

### Backend Priority
1. `backend/app/__init__.py` - Flask app factory
2. `backend/app/models/user.py` - User model
3. `backend/app/models/configuration.py` - Configuration model
4. `backend/app/routes/auth.py` - Login/register
5. `backend/app/routes/configs.py` - CRUD operations
6. `backend/config.py` - Configuration classes

### Frontend Priority
1. `frontend/src/services/api.ts` - API client
2. `frontend/src/contexts/AuthContext.tsx` - Auth state
3. `frontend/src/components/auth/Login.tsx` - Login page
4. `frontend/src/components/wizard/IPsecForm.tsx` - First form
5. `frontend/src/App.tsx` - Main app with routing

## Database Models Quick Reference

```python
# User Model
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

# Configuration Model
class Configuration(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    config_type = db.Column(db.String(50), nullable=False)
    name = db.Column(db.String(255), nullable=False)
    data_json = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
```

## API Routes Quick Reference

```
POST   /api/auth/register       - Register new user
POST   /api/auth/login          - Login and get JWT
POST   /api/auth/refresh        - Refresh JWT token

GET    /api/configs             - List configurations
POST   /api/configs             - Create configuration
GET    /api/configs/:id         - Get configuration
PUT    /api/configs/:id         - Update configuration
DELETE /api/configs/:id         - Delete configuration

GET    /api/configs/:id/export/cli    - Export as CLI script
GET    /api/configs/:id/export/json   - Export as JSON
```

## Environment Variables

```bash
# Backend
export FLASK_ENV=development
export SECRET_KEY=your-secret-key
export JWT_SECRET_KEY=your-jwt-secret
export DATABASE_URL=sqlite:///fortigate_wizard.db

# Frontend
export VITE_API_URL=http://localhost:5000
```

## Testing Commands

```bash
# Backend tests
cd backend
pytest
pytest tests/test_auth.py -v
pytest --cov=app

# Frontend tests
cd frontend
npm test
npm run test:coverage
```

## Common Issues & Solutions

### Issue: CORS errors
**Solution:** Add CORS origin in backend config
```python
from flask_cors import CORS
CORS(app, origins=['http://localhost:5173'])
```

### Issue: Database migration errors
**Solution:** Reset migrations
```bash
rm -rf migrations/
flask db init
flask db migrate
flask db upgrade
```

### Issue: JWT token not working
**Solution:** Check cookie settings
```python
app.config['JWT_TOKEN_LOCATION'] = ['cookies']
app.config['JWT_COOKIE_SECURE'] = False  # Set True in production
app.config['JWT_COOKIE_CSRF_PROTECT'] = False  # Enable in production
```

## Development Workflow

1. **Start Backend:**
   ```bash
   cd backend
   source venv/bin/activate
   flask run --debug
   ```

2. **Start Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Make Changes:**
   - Edit code
   - Save file (auto-reload enabled)
   - Test in browser

4. **Test:**
   ```bash
   # Backend
   pytest
   
   # Frontend
   npm test
   ```

5. **Commit:**
   ```bash
   git add .
   git commit -m "feat: add configuration save functionality"
   git push
   ```

## Useful URLs

- Frontend Dev: http://localhost:5173
- Backend API: http://localhost:5000
- API Docs: http://localhost:5000/api/docs
- PostgreSQL: localhost:5432

## Code Snippets

### Create Protected Route (Backend)
```python
from functools import wraps
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity

def jwt_required():
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            verify_jwt_in_request()
            return fn(*args, **kwargs)
        return decorator
    return wrapper

@app.route('/api/configs', methods=['GET'])
@jwt_required()
def get_configs():
    user_id = get_jwt_identity()
    # ... implementation
```

### API Call (Frontend)
```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true
});

export const getConfigurations = async () => {
  const response = await api.get('/api/configs');
  return response.data;
};
```

### Protected Route (Frontend)
```tsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
};
```

## Remember

- **Security:** Always validate inputs on backend
- **Testing:** Write tests as you go
- **Documentation:** Comment complex logic
- **Git:** Commit often with clear messages
- **Code Review:** Review your own code before committing

🏛️ **Precision. Excellence. No compromise.** ⚔️
