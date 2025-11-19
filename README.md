# ARP — Board Exam Mock Test Generator/Notes Viewer

**Short description**  
A modular system to scan, clean and organize previous years' board exam papers and generate randomized, customizable mock tests for standards (6th, 10th, 12th). Also an environment where students can upload there written notes to this and earn rewards. This repo contains a React + TypeScript frontend (Vite + shadcn-style components) and a Node backend (`my-project-backend`) that provides the mock-generation and admin endpoints.

---

## Quick links (in this repo)

- Frontend: `ARP1/` (Vite + React + TypeScript)
- Backend: `ARP1/my-project-backend/` (Node.js)
- Pages: Mock generator, notes viewer, profile, teacher verification, authentication, etc.

---

## Full Features

### Frontend

- **Multi-standard support:** 6th, 10th, 12th with dynamic subject loading
- **Mock Test Generator:**
  - Choose standard, subject, marks type (2/3/5/all), difficulty level
  - Choose total no. of questions
  - Automatic structured paper generation UI
- **Mock Test Results Page:**
  - Displays questions cleanly
  - Same structure across all standards
- **User Account System:**
  - Signup
  - Login
  - Teacher Verification
- **Admin Dashboard:**
  - Upload CSVs / JSON dataset
  - Manage question banks
  - Validate teachers
- **Progress & Profile Pages**
- **Notes Viewer**
- **Reusable UI components** using shadcn-style system
- Fully responsive & theme toggling included

### Backend

- **Mock Generation API**
- **Question Bank API**
- **Subjects API**
- **Admin Uploads API**
- **Teacher Verification API**
- Node-based dev server with `nodemon` support
- JSON-based dataset system

---

## Install & run (local development)

### Frontend Setup

```bash
cd ARP1
npm install
npm run dev
```

**Scripts found:**

- `dev` → `vite`
- `build` → `vite build`
- `preview` → `vite preview`

### Backend Setup

```bash
cd ARP1/my-project-backend
npm install
npm run dev
```

**Scripts found:**

- `dev` → `nodemon index.js`
- `start` → `node index.js`

---

## Frontend Architecture

```
ARP1/
 ├─ src/
 │  ├─ components/
 │  │   ├─ Navbar.tsx
 │  │   ├─ Footer.tsx
 │  │   ├─ QuickActions.tsx
 │  │   └─ ui/...
 │  ├─ pages/
 │  │   ├─ Landing.tsx
 │  │   ├─ Login.tsx
 │  │   ├─ Signup.tsx
 │  │   ├─ MockTest.tsx
 │  │   ├─ MockTestGenerator.tsx
 │  │   ├─ MockTestResults.tsx
 │  │   ├─ AdminDashboard.tsx
 │  │   ├─ TeacherVerification.tsx
 │  │   ├─ Profile.tsx
 │  │   ├─ Progress.tsx
 │  │   ├─ NotesViewer.tsx
 │  │   ├─ NotFound.tsx
 │  │   └─ rewards.tsx
 │  ├─ contexts/
 │  ├─ hooks/
 │  ├─ lib/
 │  ├─ config/
 │  ├─ main.tsx
 │  └─ App.tsx
```

---

## Backend API Contract

The frontend expects the following endpoints:

### 1. Subjects API

```
GET /api/subjects?standard=<6|10|12>
```

**Response:**

```json
[
  { "id": "maths", "name": "Mathematics" },
  { "id": "science", "name": "Science" }
]
```

---

### 2. Question Bank API

```
GET /api/questions?standard=&subject=&chapter=&marks=&difficulty=
```

**Required field structure (strict):**

```json
{
  "chapter_no": 1,
  "marks": 2,
  "difficulty": "medium",
  "question": "Define Newton’s first law."
}
```

---

### 3. Mock Generator API

```
GET /api/mock?standard=10th&subject=maths&total=10&marks=3&difficulty=medium
```

**Response:**

```json
{
  "paperId": "uuid",
  "standard": "10th",
  "subject": "maths",
  "total": 10,
  "questions": [
    { "chapter_no": 1, "marks": 3, "difficulty": "medium", "question": "..." }
  ]
}
```

---

### 4. Teacher Verification

```
POST /api/verify-teacher
```

---

### 5. File Upload (Admin)

```
POST /api/upload
Content-Type: multipart/form-data
```

---

## Data Ingestion Requirements (Very Important)

The system requires strict cleaning of datasets:

### Required fields (case-sensitive):

- `chapter_no`
- `marks`
- `difficulty`
- `question`

### Cleanup rules:

✔ Remove `Q1`, `Q2`, `Q3` prefixes  
✔ Convert `\2019` to `'`  
✔ Normalize marks (2,3,5) or whatever set you finalize  
✔ Ensure at least **100 questions per chapter per marks type** if possible  
✔ Dataset must be UTF‑8 encoded

---

## Known Issues & Solutions

### ❌ Error: _No questions found in the generated paper_

Cause: backend returned empty list  
Fix: add more questions OR loosen filters

### ❌ Subjects for 12th not showing

Cause: API returning empty array  
Fix: return at least an empty array, not an error

### ❌ Wrong marks or chapter numbers appearing

Cause: CSV → JSON conversion script mismatched columns  
Fix: update ingest script to detect column names properly

---

## Suggested Deployment (Production)

- Use **Docker** for frontend & backend
- Serve frontend using Nginx
- Expose backend via Node server (`node index.js`)
- Add CORS rules for communication
- Use environment variables for API URL and DB paths
- Host images / notes in `/public` or a CDN

---

## Testing

### Frontend

- Manual QA using `npm run dev`
- Add Vitest for unit tests
- Add Playwright for end-to-end mock generation tests

### Backend

- Test endpoints using Postman
- Add Jest tests for `/api/mock`, `/api/subjects`, `/api/questions`

---

## Future Enhancements

- OCR to auto-extract questions from PDF
- Admin label editing & verification panel
- AI-based difficulty estimation
- Auto-generation of answer keys
- Analytics for students
- Performance optimization with caching

## Final Notes

Your project is a fully scalable educational platform.  
This README is structured for real-world deployment, onboarding, and team collaboration.