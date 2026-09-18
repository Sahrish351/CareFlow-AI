# 🏥 CareFlow AI — Intelligent Patient Navigation & Smart Hospital Network

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React 19](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)

> **CareFlow AI** is an intelligent, multi-hospital patient navigation ecosystem engineered for Pakistan's healthcare landscape. It unifies outpatient care, multilingual conversational AI (English, Urdu, Roman Urdu), live queue tokens, doctor briefings, and emergency medical passports into a seamless digital journey.

---

## 🌟 Key Highlights

- 🤖 **Multilingual AI Care Navigator**: Understands everyday language in English and Roman Urdu (*"Mujhe kal dopehr Lahore mein kamar dard ke liye doctor chahiye"*).
- 🚨 **Safety-First Emergency Triage**: Automatically recognizes life-threatening red flags (chest pain, acute breathlessness) and triggers emergency dispatch protocols (1122).
- 🇵🇰 **Pakistan Reference Healthcare Network**: Features 9 tertiary care hospitals across Islamabad, Lahore, Karachi, and Rawalpindi.
- ⏱️ **Smart Live OPD Queue**: Real-time waiting positions, estimated arrival times, and digital queue tokens (#104).
- 📅 **7-Step Guided Booking Wizard**: End-to-end appointment scheduling with Supabase slot availability and double-booking prevention.
- 🛡️ **Encrypted Care Passport**: Cryptographic digital medical ID with emergency QR code, vital statistics, allergies, and blood group.
- 👨‍⚕️ **Physician Consultation Console**: Pre-consultation AI clinical briefings and one-click digital prescription generation.
- 👨‍👩‍👧 **Family Care Management**: Manage health schedules for dependents, children, and elderly family members.
- 🧪 **AI Lab Report Explainer**: Translates complex diagnostic lab panels into plain-English patient insights.

---

## 🏗️ System Architecture & Tech Stack

- **Frontend**: React 19, TypeScript, Vite 8, React Router v7
- **Styling**: Tailwind CSS v4, Lucide Icons, Framer Motion
- **Analytics & Visuals**: Recharts
- **Intelligence**: Google Gemini 1.5 Flash, Web Speech API
- **Backend & Authentication**: Supabase (PostgreSQL, Row Level Security)
- **Data Layer**: Dual-mode architecture with live Supabase client + resilient local fallback store

---

## 🚀 Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (version 18 or higher)
- npm or yarn

### 2. Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/careflow-ai.git
cd careflow-ai
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Configure Environment Variables
Copy the sample environment file:
```bash
cp .env.example .env
```
Fill in your Supabase and Gemini credentials in `.env`:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
VITE_GEMINI_API_KEY=your_gemini_api_key
```

### 5. Start Local Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🔑 Demo Access Credentials

Quick one-click login pills are provided on the login page:

| Role | Email | Password | Included Permissions |
| :--- | :--- | :--- | :--- |
| **Patient** | `patient.ahmed@careflow.ai` | `demo123` | Patient Hub, Care Passport, Live Queue, Bookings, Family Care |
| **Doctor** | `dr.sarah.farooq@careflow.ai` | `demo123` | Live OPD Queue Board, AI Clinical Briefings, Issue Rx |
| **Admin** | `admin@careflow.ai` | `demo123` | Hospital Network Metrics, Appointment Audit, Doctor Rosters |

---

## 🧪 Verification & Build Tests

- **Run Production Build:**
  ```bash
  npm run build
  ```
  Runs `tsc -b` and bundles assets with Vite. (Zero type or bundling errors).

- **Run Automated Browser QA Inspection:**
  ```bash
  node qa_inspection.js
  ```
  Runs complete headless browser end-to-end audit (Route guards, AI search, bookings, mobile responsiveness, and console checks).

---

## 📚 Complete Documentation

For an exhaustive architectural deep dive, clinical pathways breakdown, and data schemas, read [PROJECT_DOCUMENTATION.md](./PROJECT_DOCUMENTATION.md).

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
