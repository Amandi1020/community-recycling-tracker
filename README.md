# ♻️ EcoTrack — Community Recycling Tracker

A full-stack gamified platform that connects residents with recycling collectors in their district. Residents post recyclable items, collectors pick them up, and everyone tracks their environmental impact through points, levels, and badges.

🔗 **Live Demo:** _coming soon_  
🎥 **Demo Video:** _coming soon_

---

## 📌 Overview

EcoTrack solves a real community problem — making recycling easy, rewarding, and trackable. Instead of recyclables going to waste, residents list items they want to give away, and collectors browse and claim them by district. Every collection earns the resident points, contributing to their level and the district leaderboard.

This project was built to apply Management Information Systems concepts — data-driven decision making, role-based access control, and system workflows — in a real, deployable application.

---

## ✨ Features

### 🏠 Resident
- Register and post recyclable items with photos
- Track listing status (available → claimed → collected)
- Personal impact dashboard — points, level, CO₂ saved, monthly chart
- Earn badges for recycling milestones
- District leaderboard

### 🚛 Collector
- Browse available items filtered by district and category
- Claim items for pickup
- Mark items as collected
- View collection history and stats

### ⚙️ Admin
- System-wide analytics dashboard
- District-by-district recycling breakdown
- Manage all registered users

### 🎮 Gamification
- Points awarded per kg based on recyclable category
- Levels: Seedling 🌱 → Sprout 🌿 → Guardian 🌳 → Eco Hero 🏆
- Achievement badges
- CO₂ saved calculator

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite), Tailwind CSS, React Router, Recharts, Axios |
| Backend | Node.js, Express |
| Database | MySQL |
| Auth | JWT, bcrypt |
| File Uploads | Multer |

---

## 🗂️ Project Structure

community-recycling-tracker/

├── client/              # React frontend

│   └── src/

│       ├── pages/

│       │   ├── auth/

│       │   ├── resident/

│       │   ├── collector/

│       │   └── admin/

│       ├── components/

│       ├── context/

│       └── utils/

├── server/# Node.js backend

│   ├── config/

│   ├── controllers/

│   ├── middleware/

│   ├── routes/

│   └── uploads/

└── README.md

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js installed
- MySQL installed

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

Create a `.env` file in `server/`:
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=recycling_tracker
JWT_SECRET=your_secret_key
```

Run the database schema:
```bash
mysql -u root -p recycling_tracker < config/schema.sql
```

Start the backend:
```bash
npm run dev
```

### 3. Frontend setup
```bash
cd client
npm install
npm run dev
```

Visit `http://localhost:5173`

---

## 🗄️ Database Schema

The database includes 6 core tables: `users`, `categories`, `listings`, `claims`, `badges`, `user_badges` — supporting role-based access (resident, collector, admin), recyclable categorization, and achievement tracking.

---

## 🎯 Future Improvements

- Collector service radius selection
- In-app notifications for claimed items
- Resident-to-collector ratings
- PDF monthly impact reports
- Mobile app version

---

## 👩‍💻 Author

**Amandi** — MIS Undergraduate  
[GitHub](https://github.com/Amandi1020)

---

## 📄 License

This project is open source and available for educational purposes.
