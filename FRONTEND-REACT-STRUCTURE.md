# Tổng hợp Cấu trúc Frontend React

## 📋 Tổng quan dự án
Đây là ứng dụng chat realtime được xây dựng bằng **React 19** + **TypeScript** + **Vite**, sử dụng **Socket.IO** cho real-time communication và **TanStack Query** cho data fetching.

---

## 🛠️ Công nghệ & Thư viện chính

### **Framework & Core**
- **React** v19.2.0 - UI Library
- **React DOM** v19.2.0 - DOM renderer
- **TypeScript** v5.9.3 - Ngôn ngữ lập trình
- **Vite** v7.2.4 - Build tool & dev server
- **@vitejs/plugin-react** v5.1.1 - React plugin cho Vite

### **Routing**
- **react-router** v7.12.0 - Client-side routing

### **State Management**
- **zustand** v5.0.9 - Global state management (lightweight)
- **@tanstack/react-query** v5.90.16 - Server state management & caching
- **@tanstack/react-query-devtools** v5.91.2 - DevTools cho React Query

### **Real-time Communication**
- **socket.io-client** v4.8.3 - WebSocket client

### **HTTP Client**
- **axios** v1.13.2 - HTTP client
- **qs** v6.14.1 - Query string parser

### **Form Management & Validation**
- **react-hook-form** v7.67.0 - Form management
- **@hookform/resolvers** v5.2.2 - Validation resolvers
- **zod** v4.3.5 - Schema validation

### **UI Components & Styling**
- **Tailwind CSS** v4.1.18 - Utility-first CSS framework
- **@tailwindcss/vite** v4.1.18 - Tailwind plugin cho Vite
- **Radix UI** - Headless UI components:
  - @radix-ui/react-avatar v1.1.11
  - @radix-ui/react-dialog v1.1.15
  - @radix-ui/react-dropdown-menu v2.1.16
  - @radix-ui/react-label v2.1.8
  - @radix-ui/react-popover v1.1.15
  - @radix-ui/react-select v2.2.6
  - @radix-ui/react-separator v1.1.8
  - @radix-ui/react-slot v1.2.4
  - @radix-ui/react-tabs v1.1.13
- **class-variance-authority** v0.7.1 - CSS variant utilities
- **clsx** v2.1.1 - Class name utilities
- **tailwind-merge** v3.4.0 - Merge Tailwind classes
- **lucide-react** v0.555.0 - Icon library

### **Utilities**
- **date-fns** v4.1.0 - Date utilities
- **emoji-picker-react** v4.16.1 - Emoji picker
- **jwt-decode** v4.0.0 - JWT decoder
- **sonner** v2.0.7 - Toast notifications

### **Development Tools**
- **ESLint** v9.39.1 - Code linting
- **eslint-plugin-react-hooks** v7.0.1
- **eslint-plugin-react-refresh** v0.4.24
- **typescript-eslint** v8.46.4
- **tw-animate-css** v1.4.0 - Tailwind animations


---

## 🗂️ Cấu trúc thư mục

```
frontend-react/
├── public/
│   └── logo.png
│
├── src/
│   ├── main.tsx                    # Entry point
│   ├── App.tsx                     # Root component & routing
│   ├── index.css                   # Global styles
│   ├── App.css
│   │
│   ├── features/                   # Feature-based modules
│   │   ├── auth/                   # Authentication feature
│   │   │   ├── AuthLoader.ts       # Auth loader cho routing
│   │   │   ├── api/
│   │   │   │   └── authService.ts  # API calls cho auth
│   │   │   ├── components/
│   │   │   │   ├── AuthGuard.tsx   # Protected route guard
│   │   │   │   └── EditProfileDialog.tsx
│   │   │   ├── pages/
│   │   │   │   └── LoginPage.tsx
│   │   │   └── stores/
│   │   │       └── authStore.ts    # Zustand store cho auth
│   │   │
│   │   ├── chat/                   # Chat feature
│   │   │   ├── types.ts            # Chat types
│   │   │   ├── utils.ts            # Chat utilities
│   │   │   ├── api/
│   │   │   │   ├── chatService.ts  # Direct chat API
│   │   │   │   └── groupService.ts # Group chat API
│   │   │   ├── components/
│   │   │   │   ├── ChatArea.tsx
│   │   │   │   ├── ChatHeader.tsx
│   │   │   │   ├── ChatSidebar.tsx
│   │   │   │   ├── ChatView.tsx
│   │   │   │   ├── GroupCreateDialog.tsx
│   │   │   │   ├── GroupEditDialog.tsx
│   │   │   │   ├── GroupInfoDialog.tsx
│   │   │   │   ├── MessageInput.tsx
│   │   │   │   └── MessageList.tsx
│   │   │   └── hooks/
│   │   │       └── useChatSocket.ts # WebSocket hook
│   │   │
│   │   ├── blog/                   # Blog feature (placeholder)
│   │   │   ├── api/
│   │   │   └── pages/
│   │   │       └── BlogPage.tsx
│   │   │
│   │   └── user/                   # User feature
│   │       └── pages/
│   │           └── ProfilePage.tsx
│   │
│   └── shared/                     # Shared/Common resources
│       ├── components/             # Shared components
│       │   ├── ComponentWithPermissionGuard.tsx
│       │   ├── ConfirmModal.tsx
│       │   ├── ErrorBoundary.tsx
│       │   ├── GlobalLoading.tsx
│       │   ├── LoadingSpinner.tsx
│       │   ├── ReactQueryProvider.tsx
│       │   ├── ThemeProvider.tsx
│       │   ├── main-components/    # Layout components
│       │   │   ├── LeftSidebar.tsx
│       │   │   ├── MainHeader.tsx
│       │   │   ├── MainOutlet.tsx
│       │   │   └── RightSidebar.tsx
│       │   └── ui/                 # UI primitives (shadcn/ui)
│       │       ├── avatar.tsx
│       │       ├── button.tsx
│       │       ├── dialog.tsx
│       │       ├── dropdown-menu.tsx
│       │       ├── input.tsx
│       │       ├── label.tsx
│       │       └── tabs.tsx
│       │
│       ├── config/                 # Configuration
│       │   └── envConfig.ts        # Environment validation
│       │
│       ├── constants/              # Constants
│       │   └── permissions.constant.ts
│       │
│       ├── enums/                  # Enums
│       │   ├── MemberRole.enum.ts
│       │   └── MessageType.enum.ts
│       │
│       ├── layout/                 # Layout components
│       │   └── MainLayout.tsx
│       │
│       ├── lib/                    # Libraries & utilities
│       │   ├── api-routes.ts       # API route constants
│       │   ├── api.ts              # Axios instance & interceptors
│       │   ├── jwt.ts              # JWT utilities
│       │   ├── routes.ts           # Frontend routes
│       │   └── utils.ts            # Helper functions
│       │
│       ├── pages/                  # Shared pages
│       │   ├── MainFeedPage.tsx
│       │   └── NotFoundPage.tsx
│       │
│       ├── stores/                 # Global stores
│       │   ├── useGlobalLoading.ts # Loading state store
│       │   └── useSocketStore.ts   # Socket.IO store
│       │
│       └── validations/            # Zod schemas
│           ├── AuthSchema.ts
│           ├── ChatSchema.ts
│           ├── CommonSchema.ts
│           └── GroupSchema.ts
│
├── components.json                 # shadcn/ui config
├── vite.config.ts                  # Vite configuration
├── tsconfig.json                   # TypeScript config
├── tsconfig.app.json               # App TypeScript config
├── tsconfig.node.json              # Node TypeScript config
├── package.json                    # Dependencies
└── .env.example                    # Environment variables example
```

---

## 🏗️ Kiến trúc & Design Patterns

### **Feature-Based Architecture**
- Code được tổ chức theo **features** (auth, chat, blog, user)
- Mỗi feature có structure riêng: api, components, pages, hooks, stores
- **Shared folder** chứa resources dùng chung

### **State Management Strategy**

#### **1. Zustand** (Client State)
- **useAuthStore**: Authentication state (isAuth, userId, token, login, logout)
- **useSocketStore**: WebSocket state (socket, isConnected, connect, disconnect)
- **useGlobalLoading**: Loading state (isLoading, setLoading)

#### **2. TanStack Query** (Server State)
- Data fetching & caching
- Automatic refetching
- Optimistic updates
- Cache invalidation

### **Routing Strategy**
- React Router v7
- AuthGuard: Protected routes với auth check
- AuthLoader: Preload auth state
- Nested routes với layout
- Error boundary cho mỗi route

### **WebSocket Architecture**
- **useSocketStore (Zustand)**: Quản lý Socket.IO instance duy nhất
  - Auto-connect khi login
  - Auto-disconnect khi logout
  - JWT authentication
  - Reconnection logic
  - Error handling

- **useChatSocket (Hook)**: Subscribe/unsubscribe events
  - Typing indicators
  - Message handlers
  - Seen status
  - Room management

---

## 🔌 API Integration

### **Axios Configuration**
- baseURL: /api/ (dev) hoặc VITE_API_URL (prod)
- Headers: Content-Type: application/json
- Query string serializer: qs

### **Request Interceptor**
- Tự động thêm Bearer token từ authStore
- Gửi kèm Authorization header

### **Response Interceptor**
- Unwrap response data (response.data.data)
- Handle 401: Logout + redirect to login
- Phân biệt auth errors vs session expired

### **API Services**

#### **Auth Service**
- login(credentials) - Đăng nhập
- signup(userData) - Đăng ký
- logout() - Đăng xuất
- refreshToken() - Refresh access token

#### **Chat Service**
- Direct chat APIs (1-1)
- Message fetching
- File upload

#### **Group Service**
- createGroup(data) - Tạo nhóm
- getGroups() - Lấy danh sách nhóm
- getGroupById(id) - Lấy thông tin nhóm
- updateGroup(id, data) - Cập nhật nhóm
- deleteGroup(id) - Xóa nhóm
- addMembers(id, members) - Thêm thành viên
- removeMembers(id, memberId) - Xóa thành viên
- changeRole(id, memberId, role) - Đổi role

---

## 🎨 UI Components

### **shadcn/ui Components**
- Avatar - User avatars
- Button - Buttons với variants
- Dialog - Modal dialogs
- DropdownMenu - Dropdown menus
- Input - Form inputs
- Label - Form labels
- Tabs - Tab navigation

### **Custom Components**

#### **Layout Components**
- MainLayout - Main app layout
- LeftSidebar - Navigation sidebar
- MainHeader - App header
- RightSidebar - Right sidebar
- MainOutlet - Content outlet

#### **Auth Components**
- AuthGuard - Protected route wrapper
- EditProfileDialog - Edit profile modal

#### **Chat Components**
- ChatView - Main chat container
- ChatSidebar - Chat list sidebar
- ChatArea - Message area
- ChatHeader - Chat header
- MessageList - Message list
- MessageInput - Message input với emoji
- GroupCreateDialog - Create group modal
- GroupEditDialog - Edit group modal
- GroupInfoDialog - Group info modal

#### **Shared Components**
- ErrorBoundary - Error boundary
- GlobalLoading - Global loading indicator
- LoadingSpinner - Spinner component
- ConfirmModal - Confirmation dialog
- ThemeProvider - Theme provider (light/dark)
- ReactQueryProvider - React Query provider
- ComponentWithPermissionGuard - Permission-based rendering

---

## 🔐 Authentication Flow

```
1. User login → authService.login()
2. Receive tokens → authStore.login(tokens)
3. Decode JWT → Extract user info
4. Save to localStorage → Persist auth state
5. Connect Socket.IO → useSocketStore.connect(token)
6. Navigate to app → AuthGuard allows access

Logout:
1. authStore.logout()
2. Clear localStorage
3. Disconnect socket
4. Redirect to /login
```

---

## 🔌 WebSocket Events (Client-side)

### **Direct Chat**
#### Emit:
- entering - Join direct chat room
- send-message - Send message
- seen-message - Mark as seen
- typing-start - Start typing
- typing-stop - Stop typing

#### Listen:
- receive-message - New message
- message-seen - Message seen
- user-typing - User typing
- user-stopped-typing - User stopped typing

### **Group Chat**
#### Emit:
- join-group - Join group room
- leave-group - Leave group room
- send-group-message - Send group message
- seen-group-message - Mark group message as seen
- group-typing-start - Start typing in group
- group-typing-stop - Stop typing in group

#### Listen:
- new-group-message - New group message
- group-message-seen - Message seen
- member-typing - Member typing
- member-stopped-typing - Member stopped typing

---

## ⚙️ Environment Variables

```env
VITE_API_URL=http://localhost:3000/api/v1
VITE_SOCKET_URL=http://localhost:3000
VITE_ENV=development
```

### **Environment Validation** (Zod)
- Validate tất cả env vars khi app start
- Type-safe environment variables
- Auto-throw error nếu missing/invalid

---

## 🎯 Key Features

### **1. Authentication**
- JWT-based authentication
- Refresh token mechanism
- Auto-logout on token expiration
- Protected routes
- Persistent login (localStorage)

### **2. Real-time Chat**
- Direct messaging (1-1)
- Group messaging
- Typing indicators
- Message seen status
- File/image attachments
- Emoji picker
- Real-time updates

### **3. Group Management**
- Create/edit/delete groups
- Add/remove members
- Role-based permissions (Owner, Co-Owner, Member)
- Group info modal
- Member list

### **4. UI/UX**
- Responsive design (Tailwind)
- Dark/Light theme
- Toast notifications (Sonner)
- Loading states
- Error boundaries
- Smooth animations

### **5. Developer Experience**
- TypeScript strict mode
- ESLint + Prettier
- Hot Module Replacement (Vite)
- React Query DevTools
- Component-based architecture

---

## 📦 Scripts

```json
{
  "dev": "vite",
  "build": "tsc -b && vite build",
  "lint": "eslint .",
  "preview": "vite preview"
}
```

---

## 🚀 Development Workflow

### **1. Start Development**
```bash
npm run dev
```

### **2. Environment Setup**
```bash
cp .env.example .env
# Edit .env with your API URLs
```

### **3. Build for Production**
```bash
npm run build
npm run preview
```

---

## 🔧 Configuration Files

### **Vite Config**
- React plugin
- Tailwind CSS plugin
- Path alias: @ → ./src
- Proxy: /api → backend server
- CORS enabled

### **TypeScript Config**
- Strict mode
- Path alias: @/* → ./src/*
- Project references (app & node)

### **shadcn/ui Config**
- Style: default
- Base color: slate
- CSS variables enabled
- Tailwind v4
- Icon library: lucide-react

---

## 📊 Data Flow

```
Component
   ↓ (trigger action)
API Service (axios)
   ↓ (HTTP request)
Backend API
   ↓ (response)
React Query (cache)
   ↓ (update)
Component (re-render)

WebSocket Flow:
Component
   ↓ (emit event)
Socket.IO Client
   ↓ (WebSocket)
Backend Gateway
   ↓ (broadcast)
Socket.IO Client
   ↓ (update local state)
Component (re-render)
```

---

## 🎨 Styling Strategy

### **Tailwind CSS**
- Utility-first approach
- Custom theme configuration
- Responsive design
- Dark mode support

### **Component Variants** (CVA)
- variant: default | destructive | outline | ghost
- size: default | sm | lg | icon

### **Class Management**
- clsx + tailwind-merge
- cn("base-class", condition && "conditional-class")

---

## 🔒 Security Considerations

1. JWT Stored in localStorage (với refresh token rotation)
2. CSRF Protection (SameSite cookies ready)
3. XSS Protection (React auto-escaping)
4. Input Validation (Zod schemas)
5. Secure WebSocket (JWT authentication)
6. Error Handling (không expose sensitive info)

---

## 📱 Responsive Design

- Mobile-first approach
- Breakpoints: sm, md, lg, xl, 2xl
- Responsive layouts
- Touch-friendly UI
- Adaptive components

---

## 🧪 Best Practices

1. **Component Organization**: Feature-based structure
2. **State Management**: Separate client vs server state
3. **Type Safety**: TypeScript strict mode
4. **Code Splitting**: Dynamic imports (ready)
5. **Error Handling**: Error boundaries + try/catch
6. **Performance**: React Query caching + memoization
7. **Accessibility**: Radix UI (accessible by default)
8. **Code Style**: ESLint + Prettier

---

**Tạo bởi**: Rovo Dev  
**Ngày**: 2026-02-12
