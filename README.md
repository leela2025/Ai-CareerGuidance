# Ai-CareerGuidance — CareerCompassAI
## AI-Powered Career Guidance & Skill Roadmap Platform

> **Final-Year Academic Project** | Full-Stack MERN Application with Anthropic Claude AI (`claude-sonnet-4-6`)


---

## 5-Line Presentation Pitch (Read During Viva)

> "CareerCompassAI is an intelligent career guidance and personalized skill roadmap platform designed for university students. It bridges the gap between academic curricula and industry hiring standards by analyzing a student's degree, current skills, and ambitions using Claude Sonnet 4.6. The platform generates quantified career path match scores, isolates high-priority skill gaps, and dynamically builds an interactive, sequenced learning roadmap with curated free resources. Furthermore, an integrated ATS resume analyzer benchmarks resumes on a 0–100 scale, providing actionable improvements to optimize student placement outcomes."

---

## 🛠️ Tech Stack Architecture

| Layer | Technology | Details |
|---|---|---|
| **Frontend** | React 18, Vite, React Router 6, Axios, Recharts, Lucide Icons | Responsive UI styled with custom Deep Indigo & Teal Tailwind palette |
| **Backend** | Node.js, Express.js (MVC Pattern) | RESTful architecture with JWT authentication and RBAC |
| **Database** | MongoDB Atlas with Mongoose ODM | Cloud-hosted document store with indexed models & aggregation pipelines |
| **Security** | JWT (7-day Bearer Tokens), bcryptjs | Secure password hashing (10 salt rounds) & role-based middleware |
| **AI Engine** | Anthropic Claude API (`claude-sonnet-4-6`) | Strict JSON schema prompts, retry mechanism, and safe offline fallbacks |
| **Testing** | Postman Collection | Automated test scripts with dynamic `{{token}}` capture |
| **Deployment** | Render (Backend) + Vercel (Frontend) + Atlas (DB) | Zero-downtime cloud production architecture |

---

## 📁 Repository Structure

```
career-compass-ai/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB Atlas Mongoose connection & error hooks
│   ├── controllers/
│   │   ├── authController.js     # User registration, login, get current user
│   │   ├── profileController.js  # Get and upsert student profile
│   │   ├── careerController.js   # AI Career analysis and suggestion history
│   │   ├── roadmapController.js  # Roadmap generation and milestone progress toggle
│   │   ├── resumeController.js   # Resume analysis with score & feedback history
│   │   └── adminController.js    # System aggregation metrics & analytics
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT Bearer verification and req.user attachment
│   │   ├── roleMiddleware.js     # Role verification (admin vs student)
│   │   ├── errorMiddleware.js    # Centralized error handler and 404 fallbacks
│   │   └── validateMiddleware.js # express-validator input sanitization & rule checks
│   ├── models/
│   │   ├── User.js               # Name, unique email, bcrypt hash, role (student/admin)
│   │   ├── Profile.js            # User ref, degree, branch, skills, interests, resume
│   │   ├── CareerSuggestion.js   # User ref, suggested paths, match scores, skill gaps
│   │   ├── Roadmap.js            # User ref, career goal, milestone items, progress %
│   │   └── ResumeFeedback.js     # User ref, resume text, 0-100 score, strengths, improvements
│   ├── routes/                   # Modular Express routers
│   ├── services/
│   │   └── aiService.js          # Anthropic Claude SDK (claude-sonnet-4-6) + strict JSON parser
│   ├── seed/
│   │   └── seedData.js           # CLI script to populate sample students and admin
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── src/
│   │   ├── api/axios.js          # Configured Axios instance with JWT interceptor
│   │   ├── components/           # Modular cards, gauges, charts, navigation
│   │   ├── context/AuthContext.js# Global authentication and session state
│   │   ├── pages/                # 10 production pages + 404
│   │   ├── App.jsx               # Routes and ProtectedRoute guards
│   │   ├── main.jsx
│   │   └── index.css             # Tailwind theme
│   ├── tailwind.config.js
│   ├── vite.config.js
│   ├── .env.example
│   └── package.json
│
├── postman/
│   └── CareerCompassAI.postman_collection.json # Complete importable test suite
└── README.md
```

---

## ⚡ Quick Start (Local Setup)

### 1. Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)
- MongoDB instance or free MongoDB Atlas cluster

### 2. Backend Setup
```bash
cd backend
npm install

# Copy environment template
cp .env.example .env
```
Open `backend/.env` and configure your credentials:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/careercompassai?retryWrites=true&w=majority
JWT_SECRET=your_jwt_super_secret_key_2026
ANTHROPIC_API_KEY=sk-ant-api03-... # (Optional: service includes safe academic fallback if unset)
CLIENT_URL=http://localhost:5173
```

Run seed script to populate demo students and admin data:
```bash
npm run seed
```

Start the backend server:
```bash
npm run dev
# Server runs on http://localhost:5000
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install

# Copy environment template
cp .env.example .env
```
Ensure `frontend/.env` contains:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Start the Vite development server:
```bash
npm run dev
# Application opens at http://localhost:5173
```

---

## 🔑 Demo Credentials (For Viva / Examiner Testing)

| Role | Email | Password | Features Accessible |
|---|---|---|---|
| **Student** | `student@careercompass.ai` | `Student@123` | Career Guidance, Skill Roadmaps, ATS Resume Analyzer, Profile Settings |
| **Admin** | `admin@careercompass.ai` | `Admin@123` | Institutional Analytics, Recharts Aggregations, User Cohort Tables |

*(Both login accounts can also be activated instantly using the **⚡ Quick 1-Click Demo Buttons** on the `/login` page).*

---

## 🔄 End-to-End Request Flow (Viva Explanation Guide)

If asked by an examiner: *"Explain the technical request lifecycle from Login to Roadmap Generation"*:

```
1. Authentication (POST /api/auth/login)
   └── Client sends { email, password }
   └── Backend queries User model, compares bcrypt salt hash
   └── Signs JWT token containing { id, role } with 7-day expiration
   └── Frontend Axios interceptor saves token in localStorage and attaches "Authorization: Bearer <token>" to all future requests

2. Profile Onboarding (PUT /api/profile)
   └── User submits degree, branch, currentSkills[], interests[]
   └── Controller runs findOneAndUpdate with upsert:true on Profile collection

3. AI Career Guidance (POST /api/career/analyze)
   └── authMiddleware validates JWT and populates req.user
   └── Controller reads user's Profile document
   └── aiService.js sends structured prompt to Claude API (claude-sonnet-4-6)
   └── Claude returns strict JSON: { suggestedPaths: [...], skillGaps: [...], aiReasoning }
   └── Response is parsed and persisted in CareerSuggestion collection linked by user ObjectId

4. Personalized Roadmap Generation (POST /api/roadmap/generate)
   └── Controller retrieves latest identified skill gaps
   └── aiService.js prompts Claude to create sequenced milestones with verified free resources
   └── Stored as a Roadmap document with milestones: [{ skillId, skillName, status: "pending", resources: [...] }]

5. Dynamic Milestone Tracking (PATCH /api/roadmap/:skillId)
   └── Student toggles milestone from "pending" to "completed"
   └── Backend updates milestone.status and calls roadmap.recalculateProgress()
   └── Percentage is dynamically computed as: (completedCount / totalCount) * 100
   └── UI progress bar updates with smooth CSS transitions
```

---

## 📬 Postman API Testing

1. Open Postman.
2. Click **Import** → Choose file `postman/CareerCompassAI.postman_collection.json`.
3. In the collection settings, the variable `{{baseUrl}}` is preset to `http://localhost:5000/api`.
4. Run request `1. Authentication Module -> Login (Auto-Saves Token)`.
5. Postman's test script automatically extracts `response.token` and populates the `{{token}}` collection variable.
6. All subsequent requests automatically inherit this Bearer token!

---

## 🚀 Production Deployment Guide

### STEP 1: MongoDB Atlas Database Setup
1. Go to [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) and create a free account.
2. Click **Build a Database** → Select **M0 Free Tier**.
3. Choose your nearest cloud region (e.g., AWS / Mumbai or US-East).
4. Under **Security Quickstart**:
   - Create a database user with username (e.g., `dbAdmin`) and secure password.
   - Under **Network Access**, click **Add IP Address** → Choose **Allow Access from Anywhere (`0.0.0.0/0`)** so Render can connect.
5. Click **Connect** → Choose **Drivers (Node.js)**.
6. Copy the connection string. Replace `<password>` with your database user password:
   `mongodb+srv://dbAdmin:yourPassword@cluster0.mongodb.net/careercompassai?retryWrites=true&w=majority`

### STEP 2: Deploying `/backend` to Render
1. Push your code to a GitHub repository.
2. Sign in to [https://render.com/](https://render.com/).
3. Click **New +** → Select **Web Service**.
4. Connect your GitHub repository.
5. Configure the deployment settings:
   - **Root Directory:** `backend`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
6. Add the following **Environment Variables** in Render dashboard:
   - `PORT`: `5000`
   - `NODE_ENV`: `production`
   - `MONGO_URI`: *(Your MongoDB Atlas connection string from Step 1)*
   - `JWT_SECRET`: *(A secure random string, e.g. `career_compass_prod_secret_2026`)*
   - `ANTHROPIC_API_KEY`: *(Your Anthropic key `sk-ant-api03-...`)*
   - `CLIENT_URL`: *(Your Vercel URL from Step 3, e.g. `https://career-compass-ai.vercel.app`)*
7. Click **Create Web Service**. Wait for the build to finish. Copy your live backend URL (e.g. `https://career-compass-ai-backend.onrender.com`).

### STEP 3: Deploying `/frontend` to Vercel
1. Sign in to [https://vercel.com/](https://vercel.com/).
2. Click **Add New...** → **Project**.
3. Import your GitHub repository.
4. In the configuration screen:
   - **Framework Preset:** `Vite`
   - **Root Directory:** Click **Edit** and select `frontend`.
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. Under **Environment Variables**, add:
   - `VITE_API_BASE_URL`: `https://career-compass-ai-backend.onrender.com/api` *(Your Render backend URL followed by `/api`)*
6. Click **Deploy**. Vercel will build and assign your production domain.

### STEP 4: Synchronizing Production CORS
1. Return to your Render backend dashboard → **Environment Variables**.
2. Update `CLIENT_URL` to match your exact Vercel frontend domain (e.g., `https://career-compass-ai.vercel.app`).
3. Click **Save Changes** (Render will automatically redeploy with the updated CORS policy).

---

## ✅ Live Deployment Verification Checklist

- [ ] Backend health check responds at `https://your-backend.onrender.com/api/health` with `status: "healthy"`.
- [ ] MongoDB Atlas shows connected clusters and collections.
- [ ] User registration works and creates a `User` + `Profile` record in Atlas.
- [ ] 1-Click Demo login successfully authenticates.
- [ ] AI Career Guidance triggers Claude Sonnet 4.6 and returns 3–5 matched career paths.
- [ ] Personalized learning roadmap generates milestones with active links.
- [ ] Clicking a milestone updates the progress bar and persists completion in Atlas.
- [ ] Resume Analyzer scores sample resumes (0–100) with strengths and improvements.
- [ ] Admin dashboard displays Recharts analytics for administrator accounts.
