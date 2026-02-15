# FortiGate Spartan Wizard 🏛️⚔️

**Elite FortiGate Configuration Tool for Graphene Networks**

*Precision. Excellence. No compromise.*

---

## 🎯 Overview

The FortiGate Spartan Wizard is an enterprise-grade web application for generating, managing, and documenting FortiGate configurations. Built for network engineers who demand precision and efficiency.

### Key Features

- 🔐 **IPsec VPN** - Remote access configurations with Entra ID SAML
- 💾 **Configuration Library** - Save, version, and manage configs
- 📜 **Version History** - Track all changes with full audit trail
- 📋 **Templates** - Save and reuse common configurations
- 👥 **Multi-user** - Secure authentication with user isolation
- 📊 **Audit Logging** - Complete activity tracking for compliance

## 🏗️ Architecture

**Serverless Stack:**
- **Frontend:** React + TypeScript + Tailwind CSS (hosted on Vercel)
- **Backend:** Supabase (PostgreSQL + Auth + Row Level Security)
- **Database:** PostgreSQL with automatic backups
- **Auth:** Supabase Auth with JWT tokens

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Supabase account (free tier works)
- Vercel account (free tier works)

### Development Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd fortigate-wizard-project
   ```

2. **Set up Supabase:**
   - Create a new project at https://supabase.com
   - Run the SQL from `supabase-setup.sql` in the SQL Editor
   - Copy your project URL and anon key

3. **Frontend Setup:**
   ```bash
   cd frontend
   npm install

   # Create .env.local with your Supabase credentials
   echo "VITE_SUPABASE_URL=https://your-project.supabase.co" > .env.local
   echo "VITE_SUPABASE_ANON_KEY=your-anon-key" >> .env.local

   npm run dev
   ```

4. **Access the application:**
   - Frontend: http://localhost:5173

### Production Deployment

1. **Deploy to Vercel:**
   ```bash
   cd frontend
   npx vercel
   ```

2. **Set environment variables in Vercel dashboard:**
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

3. **Deploy to production:**
   ```bash
   npx vercel --prod
   ```

## 📖 Documentation

- [Project Setup Guide](PROJECT_SETUP.md) - Comprehensive setup instructions
- [Supabase Setup SQL](supabase-setup.sql) - Database schema and functions

## 🎨 Design Philosophy

**Graphene Networks Brand:**
- Red accent colors (enterprise theme)
- Dark mode interface
- Clean, professional aesthetic
- Enterprise-grade UX

**FortiOS Standards:**
- Version 7.4.0+ syntax only
- Official Fortinet documentation references
- Security best practices built-in
- Comprehensive validation

## 🔒 Security Features

- Supabase Auth with JWT tokens
- Row Level Security (RLS) on all tables
- Password hashing handled by Supabase
- Input validation (frontend)
- Audit logging for all actions
- User data isolation via RLS policies

## 📊 Configuration Types

### IPsec Remote Access VPN
Generate secure VPN configurations with:
- Azure/Entra ID SAML authentication
- Phase 1 & Phase 2 configuration
- Modern encryption (AES-256, SHA-256)
- FortiClient XML export
- CLI and GUI instructions

## 🛠️ Tech Stack

### Frontend
- React 18 with TypeScript
- Tailwind CSS for styling
- React Router for navigation
- React Query for data fetching
- Supabase JS Client

### Backend (Supabase)
- PostgreSQL database
- Supabase Auth (JWT-based)
- Row Level Security policies
- Database functions (SECURITY DEFINER)
- Automatic backups

### Deployment
- Vercel (frontend hosting)
- Supabase (backend services)
- Edge network for fast global access

## 📈 Development Roadmap

### Phase 1 (Backend API) ✅
- [x] User authentication with JWT
- [x] Configuration CRUD operations
- [x] Version history tracking
- [x] Audit logging
- [x] 100% test coverage

### Phase 2 (Frontend) ✅
- [x] React application with TypeScript
- [x] IPsec Remote Access wizard
- [x] Configuration library
- [x] Real-time output generation
- [x] Security scoring

### Phase 3 (Polish) ✅
- [x] Version history UI
- [x] Template system
- [x] Duplicate configurations
- [x] Audit log viewer

### Phase 4 (Production) ✅
- [x] Supabase migration
- [x] Vercel deployment
- [x] Row Level Security
- [x] Production-ready

### Future Enhancements
- [ ] Additional configuration types (SD-WAN, HA)
- [ ] Configuration comparison/diff
- [ ] FortiGate API integration
- [ ] Team collaboration features

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is proprietary and confidential.
© 2026 Graphene Networks. All rights reserved.

## 👥 Team

- **Product Owner:** Frank (NOC Manager)
- **Development:** Claude Code + Human oversight
- **Design:** Based on Fortinet Spartan skill

## 🔗 Resources

- [Fortinet Documentation](https://docs.fortinet.com/)
- [FortiOS 7.4 Admin Guide](https://docs.fortinet.com/document/fortigate/7.4.11/administration-guide)
- [Supabase Documentation](https://supabase.com/docs)
- [Vercel Documentation](https://vercel.com/docs)

---

## 🏛️ The Spartan Way

**Precision:** Every configuration is validated and tested.

**Excellence:** Enterprise-grade quality in every detail.

**No Compromise:** Security and reliability are non-negotiable.

Built with ⚔️ by network engineers, for network engineers.

---

**Version:** 2.0.0
**Last Updated:** 2026-02-14
**FortiOS Version:** 7.4.0+
**Stack:** React + Supabase + Vercel
