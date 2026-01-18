# Realtime Chat - Frontend React

Frontend được chuyển đổi từ HTML/CSS/JS sang React + TypeScript với các công nghệ hiện đại.

## 🚀 Công nghệ sử dụng

- **React 19** + **TypeScript**
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Radix UI** - UI components (Button, Input, Dialog, Tabs, Avatar, etc.)
- **React Hook Form** + **Zod** - Form validation
- **React Query** - Data fetching
- **Zustand** - State management
- **Socket.io-client** - Real-time communication
- **Sonner** - Toast notifications
- **React Router** - Routing

## 📦 Cài đặt

```bash
npm install
```

## 🏃 Chạy ứng dụng

```bash
npm run dev
```

Ứng dụng sẽ chạy tại `http://localhost:5173`

## 🏗️ Build

```bash
npm run build
```

## 📁 Cấu trúc dự án

```
src/
├── api/                    # API clients
│   ├── api.ts             # Axios instance với interceptors
│   ├── auth.api.ts
│   ├── message.api.ts
│   ├── user.api.ts
│   └── group.api.ts
├── features/
│   ├── auth/              # Authentication features
│   │   ├── authService.ts
│   │   ├── authStorage.ts
│   │   ├── components/
│   │   │   └── AuthGuard.tsx
│   │   └── pages/
│   │       └── LoginPage.tsx
│   └── chat/              # Chat features
│       └── pages/
│           └── ChatPage.tsx
├── shared/
│   ├── components/
│   │   ├── ui/            # UI components (Radix UI)
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── tabs.tsx
│   │   │   └── avatar.tsx
│   │   └── ReactQueryProvider.tsx
│   ├── config/
│   │   └── env.ts         # Environment config
│   └── lib/
│       └── utils.ts       # Utilities (cn function)
└── realtime/
    └── socket.ts           # Socket.io setup
```

## ✨ Tính năng

### ✅ Đã hoàn thành

- [x] Đăng nhập / Đăng ký với validation (React Hook Form + Zod)
- [x] Google OAuth integration
- [x] Chat 1-1 với real-time messages
- [x] Online/Offline status
- [x] Typing indicators
- [x] Message status (sent/seen)
- [x] Tìm kiếm users
- [x] Unread message count
- [x] UI đẹp với Tailwind CSS và Radix UI
- [x] Responsive design
- [x] Toast notifications

### 🔄 Có thể mở rộng

- [ ] Group chat features
- [ ] Profile modal (edit profile, upload avatar)
- [ ] Message search
- [ ] File attachments
- [ ] Emoji picker
- [ ] Dark mode

## 🔧 Cấu hình

Tạo file `.env` trong thư mục `frontend-react`:

```env
VITE_API_URL=http://localhost:3000
VITE_SOCKET_URL=http://localhost:3000
VITE_ENV=development
```

## 📝 Ghi chú

- Frontend sử dụng proxy trong development mode (`/api` -> backend)
- Trong production, cần cấu hình đầy đủ domain của backend
- Socket.io tự động kết nối khi user đã đăng nhập

## 🎨 UI Components

Tất cả UI components được xây dựng dựa trên Radix UI và styled với Tailwind CSS, đảm bảo:
- Accessibility
- Responsive
- Customizable
- Type-safe

## 📚 Tài liệu tham khảo

- [React](https://react.dev)
- [TypeScript](https://www.typescriptlang.org)
- [Tailwind CSS](https://tailwindcss.com)
- [Radix UI](https://www.radix-ui.com)
- [React Hook Form](https://react-hook-form.com)
- [Zod](https://zod.dev)
- [Socket.io](https://socket.io)
