# ♻️ EcoTrack — Community Recycling Tracker

> A gamified full-stack web platform that connects residents with recycling collectors across Sri Lanka's 25 districts. Residents post recyclable items, collectors claim and pick them up, and everyone tracks their environmental impact through points, levels, badges and a district leaderboard.

---

## 🌍 Real-World Problem

Sri Lanka generates over **7,500 tonnes of solid waste every day**. A significant portion is recyclable — plastic, paper, metal, glass, e-waste — but most ends up in landfills because there's no organized way to connect people who have recyclables with people who can collect them.

**EcoTrack solves this by:**
- Giving residents a simple way to list recyclable items for pickup
- Giving collectors a district-scoped browsing platform to find and claim items
- Rewarding recycling behavior through gamification — points, levels and badges
- Giving administrators real data on district-level recycling performance

---

## 🎯 Target Audience

- **Residents** — Urban and suburban Sri Lankans who want to recycle but lack access to collectors
- **Collectors & recycling centres** — Who do community-based collection but need a platform to connect with residents
- **Admins / NGOs** — Who need district-level recycling data for policy and environmental programs

---

## ✨ Features

### 🏠 Resident
- Register and post recyclable items with optional photos
- Visual category picker with icons (Plastic, Paper, E-Waste, Glass, Metal)
- Track listing status in real time — available → claimed → collected, plus cancelled
- Edit available listings through the resident API and cancel them from **My Listings**
- Rate collectors from 1–5 stars after an item is collected
- Personal impact dashboard with points, level, CO₂ saved and monthly donut chart
- Earn achievement badges for recycling milestones
- District leaderboard with podium for top 3 recyclers
- Quick action shortcuts on dashboard

### 🚛 Collector
- Register (requires admin approval before login)
- Browse available items in your district; the API also supports search and category filters
- Claim items for pickup with one click and release an active claim
- Mark items as collected to trigger resident point awards
- Collection history with stats — total collections, kg collected, pending pickups and resident ratings
- Collector dashboard with pending pickups and quick actions

### ⚙️ Admin
- System-wide analytics dashboard with 3 charts:
  - 📊 Bar chart — listings by district
  - 🥧 Pie chart — items by category
  - 📈 Line chart — monthly recycling trend
- **Manage Users** — search by name/email/district, filter by role AND status, approve/deactivate/delete accounts
- **Manage Collectors** — dedicated approval workflow with pending/active/inactive sections
- **Manage Categories** — create, edit and delete categories; edit points per kg and CO₂ coefficients
- **Audit Logs** — review recorded administrative actions with actor, entity and details
- District breakdown table with recycling stats per area
- Clickable pending collector alert linking directly to approval page

### 🎮 Gamification
- Points awarded automatically per kg × category coefficient when collected
- **4 levels:** Seedling 🌱 → Sprout 🌿 → Guardian 🌳 → Eco Hero 🏆
- **Achievement badges:** First Drop, E-Waste Warrior, 100kg Club, Eco Hero
- CO₂ saved calculator auto-updated on every collection
- District leaderboard with podium, avatar initials and rank medals

### 🔐 Security
- JWT authentication with configurable expiry (7 days by default)
- Role-based route protection (resident / collector / admin)
- Pending and inactive users blocked from logging in and from using existing tokens
- Passwords hashed with bcryptjs; changing a password invalidates older tokens
- Password reset with SHA-256-hashed, single-use tokens that expire after one hour
- Rate limiting on the API, login, registration and password reset endpoints
- Helmet security headers and a configurable CORS origin allowlist
- Server-side input validation, parameterized SQL queries and transactional writes
- Audit logging for administrative user and category changes
- Image-only uploads capped at 5 MB and stored in MySQL

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19.2, React Router 7.17, Vite 8.0, Tailwind CSS 4.3, Recharts 3.8, Axios 1.17 |
| Backend | Node.js 20.19+ (or 22.12+), Express 5.2 |
| Database | MySQL 8 with mysql2 3.22 |
| Authentication | JSON Web Token 9, bcryptjs 3 |
| File Uploads | Multer 2 — photos stored in MySQL as `LONGBLOB` |
| Security | Helmet 8, express-rate-limit 8, server-side input validation |
| Testing | Node.js built-in `node:test` |
| Fonts | Fraunces (display), Inter (body) — Google Fonts |

---

## 🗂️ Project Structure

```
community-recycling-tracker/
├── client/                          # React frontend (Vite)
│   ├── .env.example                 # VITE_API_URL
│   ├── eslint.config.js
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js               # Dev proxy for /api
│   ├── vercel.json
│   └── src/
│       ├── assets/
│       │   ├── illustrations/       # Page hero images
│       │   └── icons/               # Category & badge icons
│       ├── components/
│       │   ├── Navbar.jsx           # Role-based navigation
│       │   └── PrivateRoute.jsx     # Route protection
│       ├── context/
│       │   ├── authContext.js       # Auth context + useAuth hook
│       │   └── AuthContext.jsx      # Auth provider and session verification
│       ├── pages/
│       │   ├── auth/                # Login, Register, ForgotPassword, ResetPassword
│       │   ├── resident/            # Dashboard, PostItem, MyListings, Leaderboard
│       │   ├── collector/           # Dashboard, BrowseItems, History
│       │   └── admin/               # Dashboard, Users, Collectors, Categories, AuditLogs
│       ├── utils/
│       │   └── axios.js             # Axios instance with JWT interceptor
│       ├── App.jsx
│       ├── index.css
│       └── main.jsx
├── server/                          # Node.js backend
│   ├── .env.example                 # Server environment template
│   ├── app.js                       # Express app and middleware
│   ├── index.js                     # Server startup and graceful shutdown
│   ├── package.json
│   ├── config/
│   │   ├── db.js                    # MySQL connection pool
│   │   ├── env.js                   # Environment parsing and validation
│   │   ├── schema.sql               # Full schema + seed data
│   │   └── migrations/
│   │       ├── 001_harden_schema.sql            # Additive upgrade
│   │       └── 001_harden_schema_rollback.sql   # Destructive rollback
│   ├── controllers/
│   │   ├── adminController.js
│   │   ├── authController.js
│   │   ├── collectorController.js
│   │   ├── listingController.js
│   │   └── residentController.js
│   ├── middleware/
│   │   ├── auth.js                  # JWT verification + role checks
│   │   ├── errorHandler.js
│   │   ├── isAdmin.js
│   │   └── rateLimit.js
│   ├── routes/
│   │   ├── adminRoutes.js
│   │   ├── authRoutes.js
│   │   ├── collectorRoutes.js
│   │   ├── listingRoutes.js
│   │   └── residentRoutes.js
│   ├── scripts/
│   │   └── createAdmin.js           # Admin account creation utility
│   ├── tests/
│   │   ├── gamification.test.js
│   │   └── validation.test.js
│   ├── utils/
│   │   ├── ApiError.js
│   │   ├── asyncHandler.js
│   │   ├── audit.js
│   │   ├── gamification.js
│   │   ├── logger.js
│   │   ├── notify.js
│   │   ├── transaction.js
│   │   └── validation.js
│   └── uploads/                     # Optional static upload directory
└── README.md
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js v18+
- MySQL 8+
- Git

### 1. Clone the repository
```bash
git clone https://github.com/Amandi1020/community-recycling-tracker.git
cd community-recycling-tracker
```

### 2. Backend setup
```bash
cd server
npm install
```

Create a `.env` file inside `server/`:
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=recycling_tracker
JWT_SECRET=your_secret_key
```

Create the database in MySQL:
```sql
CREATE DATABASE recycling_tracker;
```

Run the schema file in MySQL Workbench to create all tables and seed data:
`server/config/schema.sql`

Start the backend:
```bash
npm run dev
```
Runs at `http://localhost:5000`

### 3. Frontend setup
```bash
cd client
npm install
npm run dev
```
Runs at `http://localhost:5173`

### 4. Create admin account

Run this in MySQL Workbench after setup — generate a bcrypt hash first using the `createAdmin.js` utility:
```bash
cd server
node createAdmin.js
```
Or insert directly:
```sql
USE recycling_tracker;
INSERT INTO users (name, email, password_hash, role, district, status)
VALUES ('Admin', 'admin@ecotrack.com', '<bcrypt_hash>', 'admin', 'Colombo', 'active');
```

---

## 🗄️ Database Schema

| Table | Purpose |
|---|---|
| `users` | Residents, collectors and admins with role, district, points, level and status |
| `categories` | Recyclable types with points_per_kg and co2_per_kg coefficients |
| `listings` | Items posted by residents with photo and status tracking |
| `listing_photos` | Image data stored as MySQL `LONGBLOB` |
| `claims` | Collector pickup records with award snapshots (`weight_kg`, `points_awarded`, `co2_saved`) |
| `badges` | Achievement definitions with unlock conditions |
| `user_badges` | Junction table tracking earned badges per user |
| `collector_ratings` | One resident rating and optional comment per collected claim |
| `notifications` | In-app notification records for users and admins |
| `audit_logs` | Administrative action trail that survives user deletion |
| `password_reset_tokens` | Hashed, expiring, single-use password reset tokens |

---

## 🌍 District System

EcoTrack operates at **district level** across all 25 Sri Lanka districts. Users select their district at registration. All listings, collectors, leaderboards and admin stats are automatically scoped to the correct district — a collector in Kurunegala only sees items from Kurunegala residents.

---

## ♻️ CO₂ Calculation

Each category stores a `co2_per_kg` coefficient. When a collector marks an item collected:

`co2_saved = weight_kg × co2_per_kg`

| Category | Points/kg | CO₂ saved/kg |
|---|---|---|
| Plastic | 10 | 1.5 kg |
| Paper | 5 | 0.9 kg |
| E-Waste | 20 | 2.0 kg |
| Glass | 8 | 0.7 kg |
| Metal | 15 | 1.8 kg |

---

## 🔄 Core Workflow

```
Resident registers → Posts recyclable item with photo
        ↓
Collector browses district listings → Claims item
        ↓
Collector picks up item → Marks as collected
        ↓
Resident earns points → Level updates → Badges awarded
        ↓
Admin monitors district stats → Approves collectors → Adjusts categories
```

---

## 👤 User Roles & Access

| Role | Registration | Login Condition | Access |
|---|---|---|---|
| Resident | Self-register | Immediate | Post items, dashboard, leaderboard |
| Collector | Self-register | Requires admin approval | Browse, claim, history |
| Admin | Database only | Always active | Full system management |

---

## 🚀 Future Improvements

- Live deployment (Vercel + PlanetScale)
- Collector service radius selection beyond district level
- In-app real-time notifications for claimed items
- Resident-to-collector star ratings
- PDF monthly impact report export
- SMS/email notifications via Twilio or EmailJS
- Mobile app version (React Native)
- Map view showing listing locations

---

## 📸 Screenshots

_Coming soon after deployment_

---

## 🎓 About This Project

Built by **Amandi** — 2nd Year MIS Undergraduate

This project was developed as a portfolio piece demonstrating full-stack development and core MIS concepts:
- Role-based access control
- Data-driven decision making
- Gamification systems
- Real-world workflow management
- Information systems for community problem solving

[![GitHub](https://img.shields.io/badge/GitHub-Amandi1020-4A6B4D?style=flat&logo=github)](https://github.com/Amandi1020)

---

## 📄 License

This project is open source and available for educational purposes.