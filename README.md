<div align="center">

<img src="public/logo.svg" alt="Business Nexus Logo" width="80" height="80" />

# 🏢 Business Nexus

### *Where Entrepreneurs Meet Investors*

A powerful, full-featured business collaboration platform that bridges the gap between visionary entrepreneurs and strategic investors.

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-Visit_Site-4F46E5?style=for-the-badge)](https://asadmirza-34.github.io/nexus-collaboration-platform/)
[![Vercel](https://img.shields.io/badge/▲_Vercel-Deployed-black?style=for-the-badge&logo=vercel)](https://nexus-collaboration-platform.vercel.app)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github)](https://github.com/asadmirza-34/nexus-collaboration-platform)

![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat&logo=typescript)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?style=flat&logo=tailwindcss)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat&logo=vite)

</div>

---

## 📌 Overview

**Business Nexus** is a modern role-based collaboration platform designed to connect entrepreneurs with potential investors in a seamless, professional environment. Built with cutting-edge frontend technologies, it delivers a rich user experience with real-time communication, document management, deal tracking, and much more.

> 🎓 Developed as part of my **Frontend Developer Internship** at **DevelopersHub Corporation**

---

## ✨ Features

### 🔐 Authentication & Security
- Role-based login system — **Entrepreneur** or **Investor**
- Secure session management via localStorage
- Password reset & recovery flow
- Protected routes with RoleGuard

### 📊 Dashboards
- Personalized dashboards for each user role
- Business analytics & activity overview
- Quick-access shortcuts to all features

### 💬 Communication
- Real-time **chat & messaging** system
- **Video call** integration
- **Notifications** center with live updates

### 📁 Document Management
- Upload, view & manage business documents
- Secure **Document Chamber** for sensitive files
- Entrepreneur-only document access control

### 💼 Business Tools
- **Deal tracking** system for investors
- **Meeting scheduler** & calendar integration
- **Wallet** & billing management
- Browse & connect with entrepreneurs/investors

### ⚙️ User Management
- Full **profile management** for both roles
- Account settings & preferences
- Avatar, bio & location customization

---

## 🛠️ Tech Stack

| Layer | Technology | Version |
|---|---|---|
| ⚛️ UI Framework | React | 18 |
| 🟦 Language | TypeScript | 5 |
| 🎨 Styling | Tailwind CSS | 3 |
| ⚡ Build Tool | Vite | 5 |
| 🔀 Routing | React Router DOM | 6 |
| 🧩 Icons | Lucide React | Latest |
| 🍞 Notifications | React Hot Toast | Latest |
| 📦 Deployment | GitHub Pages + Vercel | — |

---

## 📁 Project Structure
nexus-collaboration-platform/
│
├── 📂 src/
│   ├── 📂 components/
│   │   ├── 📂 layout/          # Navbar, Sidebar, DashboardLayout
│   │   ├── 📂 ui/              # Avatar, Badge, Button, Card, Input
│   │   ├── 📂 chat/            # Chat UI components
│   │   ├── 📂 collaboration/   # Collaboration features
│   │   ├── 📂 entrepreneur/    # Entrepreneur-specific components
│   │   ├── 📂 investor/        # Investor-specific components
│   │   └── 📂 routing/         # RoleGuard (protected routes)
│   │
│   ├── 📂 context/             # AuthContext — global state
│   ├── 📂 data/                # Mock users & static data
│   ├── 📂 features/            # Feature-based modules
│   ├── 📂 hooks/               # useAuth, useLocalStorageState
│   │
│   ├── 📂 pages/
│   │   ├── 📂 auth/            # Login, Register
│   │   ├── 📂 dashboard/       # Entrepreneur & Investor dashboards
│   │   ├── 📂 profile/         # User profile pages
│   │   ├── 📂 chat/            # Messaging page
│   │   ├── 📂 deals/           # Deal tracking
│   │   ├── 📂 documents/       # Document management
│   │   ├── 📂 document-chamber/# Secure documents
│   │   ├── 📂 scheduling/      # Meeting scheduler
│   │   ├── 📂 video-call/      # Video call page
│   │   ├── 📂 wallet/          # Wallet & billing
│   │   ├── 📂 notifications/   # Notifications
│   │   ├── 📂 settings/        # Account settings
│   │   └── 📂 help/            # Help center
│   │
│   ├── 📂 styles/              # Global CSS
│   ├── 📂 types/               # TypeScript interfaces
│   ├── 📂 utils/               # Helper functions
│   ├── App.tsx                 # Root component & routes
│   └── main.tsx                # Application entry point
│
├── 📂 public/                  # Static assets
├── 📂 docs/                    # Documentation
├── index.html
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── README.md

---

## 👥 User Roles & Access

| Feature | 🧑‍💼 Entrepreneur | 💰 Investor |
|---|:---:|:---:|
| Personal Dashboard | ✅ | ✅ |
| Browse Investors | ✅ | ❌ |
| Browse Entrepreneurs | ❌ | ✅ |
| Document Management | ✅ | ❌ |
| Deal Tracking | ❌ | ✅ |
| Chat & Messaging | ✅ | ✅ |
| Video Call | ✅ | ✅ |
| Meeting Scheduler | ✅ | ✅ |
| Wallet & Billing | ✅ | ✅ |
| Notifications | ✅ | ✅ |
| Profile Settings | ✅ | ✅ |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18 or higher
- **npm** v9 or higher

### 1. Clone the Repository

```bash
git clone https://github.com/asadmirza-34/nexus-collaboration-platform.git
cd nexus-collaboration-platform
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### 4. Build for Production

```bash
npm run build
```

### 5. Deploy to GitHub Pages

```bash
npx gh-pages -d dist
```

---

## 🔑 Demo Credentials

| Role | Email | Password |
|---|---|---|
| 🧑‍💼 Entrepreneur | entrepreneur@demo.com | password |
| 💰 Investor | investor@demo.com | password |

---

## 📱 Responsive Design

| Device | Support |
|---|---|
| 📱 Mobile | ✅ Fully Responsive |
| 💻 Tablet | ✅ Fully Responsive |
| 🖥️ Desktop | ✅ Optimized |

---

## 🌐 Deployment

This project is deployed on two platforms:

| Platform | URL |
|---|---|
| GitHub Pages | [asadmirza-34.github.io/nexus-collaboration-platform](https://asadmirza-34.github.io/nexus-collaboration-platform/) |
| Vercel | [nexus-collaboration-platform.vercel.app](https://nexus-collaboration-platform.vercel.app) |

---

## 👨‍💻 Author

<div align="center">

**Asad Mirza**
Frontend Developer Intern

*DevelopersHub Corporation*

[![GitHub](https://img.shields.io/badge/GitHub-asadmirza--34-181717?style=for-the-badge&logo=github)](https://github.com/asadmirza-34)

</div>

---

<div align="center">

⭐ **If you found this project helpful, please give it a star!** ⭐

*Built with ❤️ during my frontend internship at DevelopersHub Corporation*

</div>
