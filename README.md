Here’s a clean, professional **README.md** you can drop straight into your GitHub repo for **Project Pinnacle**. It’s written to explain the purpose clearly, document the stack, and leave room for future growth.

---

# 🏔️ Project Pinnacle

**Project Pinnacle** is a player development and performance tracking platform designed for baseball training environments. It allows coaches and athletes to manage players, assign drills, track sessions, and analyze pitch metrics from CSV uploads (e.g. Rapsodo data) in a centralized dashboard.

---

## 🚀 Features

### 👤 Player Management

* Create and manage player profiles
* Store biographical and physical attributes
* Track player history and notes over time

### 🧠 Drill Management

* Create drills with tags
* Assign drills to players
* Organize development plans by skill focus

### 📆 Session Tracking

* Create and edit training sessions
* Timeline view of all sessions per player
* Upload CSV data for session metrics

### ⚾ Pitch Metrics (Rapsodo CSV)

* Upload pitch data via CSV
* Automatically group by **Pitch Type**
* Calculate:

  * Average Velocity
  * Max Velocity
  * Total Spin
  * Vertical & Horizontal Break
  * Spin Efficiency
  * Gyro Degree
  * Release Metrics
* Display pivot-style tables by pitch type

### 📊 Data Visualization (In Progress)

* Session-based metric comparison
* Pitch-type breakdowns
* Future support for charts and trend analysis

---

## 🛠️ Tech Stack

### Frontend

* **React**
* **Vite**
* **Tailwind CSS**
* **React Router**
* **PapaParse** (CSV parsing)

### Backend

* **Node.js**
* **Express**
* **PostgreSQL**
* **REST API architecture**

---

## 📂 Project Structure

```text
frontend/
├── src/
│   ├── api/
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── PlayerDetail.jsx
│   │   ├── Session/
│   │   │   └── components/
│   │   │       ├── SessionModal.jsx
│   │   │       ├── SessionTimeline.jsx
│   │   │       └── SessionCSVUploadModal.jsx
│   └── components/
│
backend/
├── routes/
├── controllers/
├── models/
└── database/
```

---

## ⚙️ Setup Instructions

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/your-username/project-pinnacle.git
cd project-pinnacle
```

---

### 2️⃣ Install Dependencies

#### Frontend

```bash
cd frontend
npm install
```

#### Backend

```bash
cd backend
npm install
```

---

### 3️⃣ Environment Variables

Create a `.env` file in the backend directory:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/pinnacle
PORT=3001
```

---

### 4️⃣ Run the App

#### Backend

```bash
uvicorn app.main:app --reload
```

#### Frontend

```bash
npm run dev
```

Then visit:

```
http://localhost:5173
```

---

## 📄 CSV Format (Rapsodo)

Project Pinnacle expects pitch data in a tab-delimited CSV with headers such as:

```text
Pitch Type
Velocity
Total Spin
Spin Efficiency (release)
VB (spin)
HB (trajectory)
Release Angle
Horizontal Angle
Release Height
Release Side
Gyro Degree (deg)
```

* Headers must be in the **first row**
* Each row represents one pitch
* Data is grouped and averaged by pitch type

---

