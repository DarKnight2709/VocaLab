# VocaLab Backend (NestJS)

<p align="center">
  <img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" />
</p>

<p align="center">
  The robust, scalable, and real-time backend API powering the <strong>VocaLab</strong> platform.
</p>

## 🚀 Technology Stack

- **Framework**: [NestJS](https://nestjs.com/) (Node.js)
- **Language**: TypeScript
- **Database**: PostgreSQL with [Prisma ORM](https://www.prisma.io/)
- **Caching & Queues**: Redis + [BullMQ](https://docs.nestjs.com/techniques/queues)
- **Real-time**: [Socket.io](https://socket.io/) (WebSockets)
- **Authentication**: JWT, Passport, Google OAuth 2.0
- **Cloud Storage**: Cloudinary
- **Notifications**: Firebase Admin SDK (Push), Nodemailer (Email)

## ✨ Core Features

- **Robust REST API**: Modular architecture built on NestJS principles for high maintainability.
- **Real-time Engine**: WebSocket gateways for direct messaging, group chats, and instant notifications.
- **Advanced Auth**: Secure authentication flow with access/refresh tokens, 2FA (Two-Factor Authentication), and Google OAuth integration.
- **Spaced Repetition System (SRS)**: Algorithmic scheduling for vocabulary flashcards based on user performance.
- **Background Processing**: Redis-backed message queues for processing emails, reminders, and heavy tasks asynchronously.
- **Type-Safe Database**: Fully typed database queries and schema migrations using Prisma.

## 📦 Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- Redis Server
- Cloudinary Account
- Firebase Service Account

## 🛠️ Installation & Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment Configuration:**
   Create a `.env` file in the root of the backend directory. You can use the `.env.example` as a template (ensure all necessary API keys and database URLs are provided).
   ```bash
   cp .env.example .env
   ```

3. **Database Setup:**
   Run Prisma migrations to set up your PostgreSQL database schema:
   ```bash
   npm run prisma:migrate
   ```
   *(Optional)* Seed the database with initial data:
   ```bash
   npm run prisma:seed
   ```

4. **Start the Development Server:**
   ```bash
   npm run start:dev
   ```
   The API will be available at `http://localhost:3000` (or your configured port). Swagger documentation is typically available at `/api/v1/docs`.

## 📜 Available Scripts

- `npm run start:dev` - Starts the application in watch mode for development.
- `npm run build` - Builds the application for production.
- `npm run start:prod` - Runs the compiled production build.
- `npm run prisma:generate` - Generates the Prisma Client.
- `npm run prisma:studio` - Opens the visual database browser for Prisma.
- `npm run test` - Runs unit tests using Jest.
- `npm run lint` - Lints the codebase with ESLint.

## 🔒 Security & Best Practices

- **RSA Keys for JWT**: Uses secure RSA key pairs for signing and verifying tokens.
- **Rate Limiting & Helmet**: Protects against brute-force attacks and sets secure HTTP headers.
- **Data Validation**: Strict input validation using `class-validator` and custom pipes.
- **Exception Filters**: Centralized error handling to ensure consistent API responses and hide internal server errors from clients.

## 📄 License

This project is licensed under the MIT License.
