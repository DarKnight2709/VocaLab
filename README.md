<div align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&height=200&section=header&text=VocaLab&fontSize=90&animation=fadeIn" alt="VocaLab Header"/>
  <br>
  <h3>An advanced, interactive platform for English vocabulary mastery.</h3>
  <p>
    Built with <strong>NestJS</strong>, <strong>React</strong>, <strong>PostgreSQL</strong>, and <strong>Redis</strong>. 
  </p>

  <div>
    <img src="https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS"/>
    <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React"/>
    <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"/>
    <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL"/>
    <img src="https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white" alt="Redis"/>
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS"/>
  </div>
</div>

<hr/>

## 📖 About VocaLab

**VocaLab** is not just another flashcard app. It is a comprehensive vocabulary learning platform designed to make language acquisition highly efficient.

## ✨ Core Features

*   **High-Performance Dictionary Engine:** Fast and reliable word lookups powered by external APIs. Incorporates a **Redis caching layer** and graceful fallback mechanisms to ensure uninterrupted service.
*   **Dynamic Flashcard Management:** Seamlessly save vocabulary directly from dictionary searches into personalized collections for structured studying and organization.
*   **Secure Authentication System:** Robust user identity management featuring JWT-based authentication and seamless Google OAuth 2.0 integration via Passport.js.
*   **Scalable Real-Time Infrastructure:** Built with Socket.io to support bi-directional data flow, paving the way for instant updates and interactive features.
*   **Modern & Responsive UI:** Crafted with React 19, Tailwind CSS, and Radix UI components for an accessible, aesthetically pleasing, and highly interactive user experience.


## 🛠 Technology Stack

### Backend (`/backend-nestjs`)
*   **Framework:** NestJS (Node.js)
*   **Language:** TypeScript
*   **Database:** PostgreSQL with **Prisma ORM**
*   **Caching & Queues:** Redis (via BullMQ and Cache Manager)
*   **Real-time:** Socket.io
*   **Authentication:** JWT, Passport (Google OAuth), Firebase Admin
*   **Media Storage:** Cloudinary
*   **Documentation:** Swagger / OpenAPI

### Frontend (`/frontend-react`)
*   **Library:** React 19 + Vite
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS v4, Radix UI, Class Variance Authority (CVA)
*   **State Management:** Redux Toolkit, Zustand, React Query
*   **Form Handling:** React Hook Form + Zod validation
*   **Routing:** React Router v7
*   **Rich Text:** TipTap Editor
*   **Real-time:** Socket.io-client

## 🚀 Getting Started

### Prerequisites
*   Node.js (v18+)
*   PostgreSQL
*   Redis
*   Docker (Optional, for easy database/Redis setup)

### Local Development Setup

**1. Clone the repository**
```bash
git clone https://github.com/DarKnight2709/VocaLab.git
cd VocaLab
```

**2. Backend Setup**
```bash
cd backend-nestjs
npm install

# Set up your environment variables (.env) based on .env.example
# Run Prisma migrations
npm run prisma:migrate
npm run prisma:generate

# Start the NestJS server
npm run start:dev
```
*API Documentation available at: `http://localhost:3000/api` (Swagger)*

**3. Frontend Setup**
```bash
cd ../frontend-react
npm install

# Start the Vite development server
npm run dev
```


## 📄 License
This project is proprietary and confidential. All rights reserved.
