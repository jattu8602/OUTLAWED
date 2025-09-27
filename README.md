# ⚖️ Outlawed – AI-Powered CLAT Preparation Platform  
![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=nextdotjs) 
![Prisma](https://img.shields.io/badge/Prisma-ORM-blue?logo=prisma) 
![MongoDB](https://img.shields.io/badge/MongoDB-Database-green?logo=mongodb) 
![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?logo=tailwindcss) 
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

> *Making CLAT prep smarter, adaptive, and affordable with AI.*  

---

## 📌 Overview  
Outlawed is an **AI-driven study companion** built with **Next.js, Prisma, and MongoDB**.  
It replicates the **real CLAT exam experience** with **120-question passage-rich mocks**, adaptive learning, and community features.  

🎯 **Vision**: Democratize access to **personalized, exam-accurate CLAT prep** with:  
- AI-powered test generation  
- Adaptive schedules & weak-area tracking  
- Gamified, engaging learning experiences  
- Secure, scalable, and institute-ready admin tools  

---

## 🚀 Key Features  

### 👩‍🎓 Student Features  
- **AI Test Engine** – Auto-generate CLAT-standard 120Q mocks (online + PDF)  
- **Adaptive Learning** – Personalized schedules, weak-point analysis  
- **Progress Tracking** – Accuracy, study streaks, time analysis  
- **Gamification** – Leaderboards, streak rewards, motivational nudges  
- **Community Learning** – Study rooms, peer sharing, group chat  
- **24/7 AI Assistant** – Instant doubt-solving with multilingual support  

### 👨‍💼 Admin Features  
1. **User Management**  
   - View all users with profile photo, role, and subscription details  
   - Role changes (FREE ↔ PAID ↔ ADMIN)  
   - Block/unblock users in real time  

2. **Test Creation**  
   - Rich metadata: title, description, type (FREE/PAID)  
   - Configurable marks, duration, highlights, thumbnail  
   - Validation + error handling  

3. **Question Management** *(in progress)*  
   - Add comprehension, tables, images  
   - Organize section-wise (English, GK, Legal, Logic, Quant)  
   - Support multiple Q-types (OPTIONS, INPUT)  

4. **Advanced Admin Controls** *(planned)*  
   - Test editing, visibility toggle (active/inactive)  
   - View test statistics  
   - Notifications, analytics dashboard, payment integration  

---

## 🧩 Tech Stack  
- **Frontend**: Next.js 14 (App Router) + Tailwind CSS  
- **Backend**: Node.js / FastAPI  
- **Database**: MongoDB with Prisma ORM  
- **Auth**: NextAuth.js  
- **AI/ML**:  
  - Gemini RAG / ChatGPT / HuggingFace APIs  
  - Semantic Search (Vector DB)  
  - PDF/Word Scraper for past papers  
  - Whisper NLP (Hindi-English support)  
- **Deployment**: Vercel / Render + GitHub CI/CD  

---

## 📂 Project Structure  
```
clatprep/
├── app/
│ ├── admin/ # Admin panel
│ │ ├── users/ # User management
│ │ ├── create-test/ # Test creation
│ │ └── ...
│ ├── api/ # API routes
│ │ └── admin/ # Admin endpoints
│ └── dashboard/ # User dashboard
├── components/
│ └── ui/ # Reusable UI components
├── prisma/
│ └── schema.prisma # Database schema
└── lib/
└── utils.js # Utilities
```


---

## 📝 Database Schema Highlights  

### Enums  
- `QuestionType`: OPTIONS | INPUT  
- `OptionType`: SINGLE | MULTI  
- `SectionType`: ENGLISH | GK_CA | LEGAL_REASONING | LOGICAL_REASONING | QUANTITATIVE_TECHNIQUES  

### Enhanced Models  
- **Test**: Rich metadata (duration, marks, highlights)  
- **Question**: Complex Q-types with comprehension, tables, images  
- **Answer**: Tracks responses, timing, reporting  
- **TestAttempt**: Total time, attempted count  
- **User**: Role-based + blocking  

---

## 🔐 Data & Privacy  
- Minimal data collected (name, email)  
- Data encrypted & anonymized  
- Leaderboards show **rank only** (no personal info)  
- No sharing of personal data with third parties  

---

## 🚀 Getting Started  

### 1. Install Dependencies  
```bash
npm install
```
### 2. Environment Setup
```bash
cp .env.example .env.local
# Configure MongoDB + NextAuth
```
### 3. Database Setup
```bash
npx prisma generate
npx prisma db push
```
### 4. Run Dev Server
```bash
npm run dev
```
## 🔄 Development Workflow  
- Update schema in `prisma/schema.prisma`  
- Generate client → `npx prisma generate`  
- Push DB changes → `npx prisma db push`  
- Create UI components as needed  
- Build API routes  
- Connect frontend  
- Test thoroughly  

---

## 📊 Evaluation Metrics  
- **Engagement** → DAU, streaks, session time  
- **Time-Saving** → Test generation <5s  
- **Learning Progress** → Score improvement  
- **Accuracy** → >90% CLAT pattern match  
- **Scalability** → Thousands of learners concurrently  
- **Adoption & Retention** → Registered vs active users  

---

## ✨ Anticipated Impact  
- Reduce dependency on costly offline coaching  
- Empower aspirants with **AI-curated adaptive prep**  
- Build a **peer-learning ecosystem** (rooms, leaderboards)  
- Offer **scalable, affordable, and exam-accurate preparation**  

---

## 👨‍💻 Team Mantrix – Samadhan 2.0  

```
