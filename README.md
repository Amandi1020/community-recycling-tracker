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
- Register and post recyclable items with photos
- Visual category picker with icons (Plastic, Paper, E-Waste, Glass, Metal)
- Track listing status in real time — available → claimed → collected
- Personal impact dashboard with points, level, CO₂ saved and monthly donut chart
- Earn achievement badges for recycling milestones
- District leaderboard with podium for top 3 recyclers
- Quick action shortcuts on dashboard

### 🚛 Collector
- Register (requires admin approval before login)
- Browse available items filtered by district and category
- Claim items for pickup with one click
- Mark items as collected to trigger resident point awards
- Collection history with stats — total collections, kg collected, pending pickups
- Collector dashboard with quick actions

### ⚙️ Admin
- System-wide analytics dashboard with 3 charts:
  - 📊 Bar chart — listings by district
  - 🥧 Pie chart — items by category
  - 📈 Line chart — monthly recycling trend
- **Manage Users** — search by name/email/district, filter by role AND status, approve/deactivate/delete accounts
- **Manage Collectors** — dedicated approval workflow with pending/active/inactive sections
- **Manage Categories** — edit points per kg and CO₂ coefficients in real time
- District breakdown table with recycling stats per area
- Clickable pending collector alert linking directly to approval page

### 🎮 Gamification
- Points awarded automatically per kg × category coefficient when collected
- **4 levels:** Seedling 🌱 → Sprout 🌿 → Guardian 🌳 → Eco Hero 🏆
- **Achievement badges:** First Drop, E-Waste Warrior, 100kg Club, Eco Hero
- CO₂ saved calculator auto-updated on every collection
- District leaderboard with podium, avatar initials and rank medals

### 🔐 Security
- JWT authentication with 7-day expiry
- Role-based route protection (resident / collector / admin)
- Pending and inactive users blocked from logging in
- bcrypt password hashing
- Admin-only protected API routes

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 (Vite), Tailwind CSS v4, React Router v6, Recharts, Axios |
| Backend | Node.js, Express.js |
| Database | MySQL 8 |
| Authentication | JWT, bcrypt |
| File Uploads | Multer |
| Fonts | Fraunces (display), Inter (body) — Google Fonts |

---

## 🗂️ Project Structure

```
community-recycling-tracker/
├── client/                          # React frontend (Vite)
│   └── src/
│       ├── assets/
│       │   ├── illustrations/       # Page hero images
│       │   └── icons/               # Category & badge icons
│       ├── components/
│       │   ├── Navbar.jsx           # Role-based navigation
│       │   └── PrivateRoute.jsx     # Route protection
│       ├── context/
│       │   └── AuthContext.jsx      # Global auth state
│       ├── pages/
│       │   ├── auth/                # Login, Register
│       │   ├── resident/            # Dashboard, PostItem, MyListings, Leaderboard
│       │   ├── collector/           # Dashboard, BrowseItems, History
│       │   └── admin/               # Dashboard, Users, Collectors, Categories
│       └── utils/
│           └── axios.js             # Axios instance with JWT interceptor
├── server/                          # Node.js backend
│   ├── config/
│   │   ├── db.js                    # MySQL connection pool
│   │   └── schema.sql               # Database schema + seed data
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── residentController.js
│   │   ├── collectorController.js
│   │   └── adminController.js
│   ├── middleware/
│   │   └── auth.js                  # JWT verification middleware
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── residentRoutes.js
│   │   ├── collectorRoutes.js
│   │   └── adminRoutes.js
│   └── uploads/                     # Uploaded item photos
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
| `claims` | Collector pickup records linking listings to collectors |
| `badges` | Achievement definitions with unlock conditions |
| `user_badges` | Junction table tracking earned badges per user |

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