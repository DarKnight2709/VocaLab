# VocaLab Frontend (React)

<p align="center">
  <img src="https://vitejs.dev/logo.svg" width="100" alt="Vite Logo" />
  <img src="https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg" width="100" alt="React Logo" />
</p>

<p align="center">
  The modern, responsive, and real-time user interface for the <strong>VocaLab</strong> platform.
</p>

## 🚀 Technology Stack

- **Core**: React 19 + TypeScript
- **Build Tool**: [Vite](https://vitejs.dev/) for lightning-fast HMR and optimized builds
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/) (Headless, accessible components)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/) (Global state) + [React Query](https://tanstack.com/query/latest) (Server state)
- **Routing**: React Router v7
- **Form Handling**: React Hook Form + Zod validation
- **Real-time**: Socket.io-client
- **Internationalization**: i18next

## ✨ Core Features

- **Rich User Interface**: Beautifully designed components with dark mode support and modern micro-animations.
- **Real-time Collaboration**: Instant messaging (1-on-1 and group chats), typing indicators, and live notifications powered by WebSockets.
- **Spaced Repetition Learning**: Interactive flashcard study modes optimized for vocabulary retention.
- **Multi-language Support**: Full i18n support allowing users to seamlessly switch between English and Vietnamese.
- **Optimistic UI Updates**: Instant feedback for user actions (like upvoting or sending messages) using React Query mutations.
- **Secure Authentication**: Integration with Google OAuth, 2FA setup, and secure JWT handling.

## 📦 Prerequisites

- Node.js (v18 or higher)
- A running instance of the VocaLab Backend (NestJS)

## 🛠️ Installation & Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment Configuration:**
   Create a `.env` file in the root of the frontend directory. Use `.env.example` as a template.
   ```bash
   cp .env.example .env
   ```
   Ensure `VITE_API_URL` and `VITE_SOCKET_URL` point to your local backend instance (typically `http://localhost:3000`).

3. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5173`.

## 📜 Available Scripts

- `npm run dev` - Starts the Vite development server with Hot Module Replacement (HMR).
- `npm run build` - Type-checks the codebase and creates a production-ready build in the `dist/` directory.
- `npm run preview` - Boots up a local static web server that serves the files from `dist/` to preview the production build.
- `npm run lint` - Runs ESLint to catch code quality and formatting issues.

## 🎨 UI Architecture

- **Radix UI Primitives**: We utilize unstyled, accessible components from Radix UI as the foundation for complex interactive elements like Dialogs, Popovers, and Dropdowns.
- **Tailwind CSS**: Utility-first styling ensures consistency and rapid development. The theme configuration is tightly integrated with CSS variables for dynamic theme switching.
- **Component Structure**: Shared components live in `src/shared/components`, while feature-specific components are encapsulated within their respective domains in `src/features/`.

## 📄 License

This project is licensed under the MIT License.
