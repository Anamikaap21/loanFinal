# RealCred Technology Private Limited
## Loan Distribution Website + CRM Management System

> **Tagline:** Your Loan. One Guided Route.  
> **Official Domain:** https://realcred.in  
> **Company:** RealCred Technology Private Limited  
> **Headquarters:** D-9, Ground Floor, Workshala, Vyapar Marg, Block D, Noida Sector 3, Noida, Uttar Pradesh 201301, India.

---

### Technology Stack
- **Frontend:** React.js, Vite, Tailwind CSS, Lucide React, Recharts, React Hook Form, Zod, Axios
- **Backend:** Node.js, Express.js, JWT, bcryptjs, Helmet, CORS, Multer, PDFKit
- **Database:** MongoDB Local (`mongodb://127.0.0.1:27017/realcred`)
- **Database GUI:** MongoDB Compass

---

### Project Directory Structure
```
RealCred/ (loanFinal)
├── frontend/
│   ├── public/
│   │   ├── assets/
│   │   │   ├── logo/
│   │   │   ├── team/
│   │   │   └── images/
│   │   └── favicon.ico
│   ├── src/
│   │   ├── components/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── context/
│   │   ├── routes/
│   │   ├── styles/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.example
│   └── package.json
│
├── backend/
│   ├── config/
│   ├── models/
│   ├── controllers/
│   ├── routes/
│   ├── middleware/
│   ├── services/
│   ├── validators/
│   ├── uploads/
│   ├── scripts/
│   ├── tests/
│   ├── .env.example
│   ├── server.js
│   └── package.json
│
├── DEVELOPMENT_PROGRESS.md
├── README.md
└── .gitignore
```

---

### Prerequisites
1. **Node.js** (v18+ or v22 LTS recommended)
2. **MongoDB Community Server** installed and running locally on port 27017
3. **MongoDB Compass** (optional, recommended for viewing database collections)

---

### Installation & Quick Start

#### 1. Setup Backend
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```
Backend will start on `http://localhost:5000`.  
Verify health endpoint: `http://localhost:5000/api/health`.

#### 2. Setup Frontend
```bash
cd ../frontend
npm install
cp .env.example .env
npm run dev
```
Frontend will start on `http://localhost:5173`.

---

### Database Configuration (MongoDB Compass)
- **Connection URI:** `mongodb://127.0.0.1:27017`
- **Database Name:** `realcred`
- Collections will be automatically created on schema initialization.

---

### Design System & Brand Palette
- **Black:** `#111111`
- **Dark Black:** `#171717`
- **Brand Red:** `#C8102E`
- **Accent Red:** `#EF3340`
- **White:** `#FFFFFF`
- **Secondary Grey:** `#A1A1AA`
