# Tổng hợp Cấu trúc Backend NestJS

## 📋 Tổng quan dự án
Đây là một ứng dụng chat realtime được xây dựng bằng **NestJS** với kiến trúc **Clean Architecture**, hỗ trợ chat 1-1 và chat nhóm qua **WebSocket** (Socket.IO).

---

## 🛠️ Công nghệ & Thư viện chính

### **Framework & Core**
- **NestJS** v11.0.1 - Framework Node.js
- **TypeScript** v5.7.3 - Ngôn ngữ lập trình
- **Node.js** - Runtime environment (target ES2023)

### **Database & ORM**
- **PostgreSQL** - Database chính (Docker container)
- **Prisma** v7.3.0 - ORM (Object-Relational Mapping)
- **@prisma/adapter-pg** - PostgreSQL adapter cho Prisma
- **pg** - PostgreSQL driver

### **Authentication & Security**
- **@nestjs/jwt** v11.0.2 - JWT authentication
- **@nestjs/passport** v11.0.5 - Passport integration
- **passport-jwt** v4.0.1 - JWT strategy
- **bcrypt** v6.0.0 & **bcryptjs** v3.0.3 - Password hashing
- **jsonwebtoken** v9.0.3 - JWT token generation
- **helmet** v8.1.0 - Security headers
- **RSA Keys** - Public/Private key encryption

### **Real-time Communication**
- **@nestjs/websockets** v11.1.12 - WebSocket support
- **@nestjs/platform-socket.io** v11.1.12 - Socket.IO platform
- **@socket.io/redis-adapter** v8.3.0 - Redis adapter cho Socket.IO (chuẩn bị scale)

### **File Upload & Cloud Storage**
- **cloudinary** v2.9.0 - Cloud storage cho ảnh/file
- **multer** v2.0.2 - File upload middleware
- **streamifier** v0.1.1 - Stream conversion

### **Validation & Transformation**
- **class-validator** v0.14.3 - DTO validation
- **class-transformer** v0.5.1 - Object transformation

### **API Documentation**
- **@nestjs/swagger** v11.2.5 - OpenAPI/Swagger documentation

### **Utilities**
- **@nestjs/config** v4.0.2 - Configuration management
- **nestjs-cls** v6.2.0 - Context Local Storage
- **lodash** v4.17.23 - Utility functions
- **compression** v1.8.1 - Response compression
- **redis** v4.7.0 - Redis client (caching)

### **Development & Testing**
- **Jest** v30.0.0 - Testing framework
- **ts-jest** v29.2.5 - TypeScript support for Jest
- **supertest** v7.0.0 - HTTP testing
- **ESLint** v9.18.0 - Code linting
- **Prettier** v3.4.2 - Code formatting
- **tsx** v4.21.0 - TypeScript execution

---

## 🗂️ Cấu trúc thư mục

```
backend-nestjs/
├── prisma/                          # Database schema & migrations
│   ├── schema.prisma               # Prisma schema definition
│   ├── migrations/                 # Database migrations
│   └── seeds/                      # Database seed files
│       └── permission.seed.ts
│
├── src/
│   ├── main.ts                     # Entry point
│   ├── app.module.ts               # Root module
│   ├── app.service.ts              # Root service
│   │
│   ├── common/                     # Shared/Common layer
│   │   ├── global.module.ts        # Global module (services, filters, pipes)
│   │   ├── decorators/             # Custom decorators
│   │   │   ├── current-user.decorator.ts
│   │   │   ├── protected.decorator.ts
│   │   │   ├── public.decorator.ts
│   │   │   └── socket-user.decorator.ts
│   │   ├── enums/
│   │   │   └── group-permission.enum.ts
│   │   ├── filters/                # Exception filters
│   │   │   ├── http-exception.filter.ts
│   │   │   └── ws-exception.filter.ts
│   │   ├── guards/                 # Guards (authentication, authorization)
│   │   │   ├── jwt-auth.guard.ts
│   │   │   ├── permission.guard.ts
│   │   │   └── socket-auth.guard.ts
│   │   ├── interceptors/
│   │   │   └── transform.interceptor.ts
│   │   ├── middlewares/
│   │   │   └── logger.middleware.ts
│   │   ├── pipes/                  # Validation pipes
│   │   │   ├── validation.pipe.ts
│   │   │   └── ws-validation.pipe.ts
│   │   ├── services/               # Global services
│   │   │   ├── cloudinary.service.ts
│   │   │   ├── config.service.ts
│   │   │   └── hashing.service.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── utils/
│   │       └── RsaKeyManager.ts
│   │
│   ├── core/                       # Core infrastructure
│   │   ├── cache/
│   │   │   └── redis.service.ts
│   │   ├── configs/                # Configuration files
│   │   │   ├── cloudinary.config.ts
│   │   │   ├── cors.config.ts
│   │   │   ├── env.config.ts       # Environment validation
│   │   │   └── swagger.config.ts
│   │   └── database/
│   │       └── prisma.service.ts   # Prisma client service
│   │
│   └── modules/                    # Feature modules
│       ├── auth/                   # Authentication module
│       │   ├── auth.module.ts
│       │   ├── auth.controller.ts
│       │   ├── auth.dto.ts
│       │   ├── services/
│       │   │   └── auth.service.ts
│       │   └── strategies/
│       │       └── jwt.strategy.ts
│       │
│       ├── users/                  # User management module
│       │   ├── users.module.ts
│       │   ├── users.controller.ts
│       │   ├── domain/
│       │   │   ├── user.entity.ts
│       │   │   └── interfaces/
│       │   │       └── user-repository.interface.ts
│       │   ├── dto/
│       │   │   └── users.dto.ts
│       │   ├── repositories/
│       │   │   └── user.repository.ts
│       │   └── services/
│       │       └── user.service.ts
│       │
│       ├── messages/               # Messages module
│       │   ├── messages.module.ts
│       │   ├── messages.controller.ts
│       │   ├── domain/
│       │   │   ├── message.entity.ts
│       │   │   ├── interfaces/
│       │   │   │   └── messages-repository.interface.ts
│       │   │   └── types/
│       │   │       └── message-attachment.type.ts
│       │   ├── dto/
│       │   │   ├── message-attachment.dto.ts
│       │   │   └── send-message.dto.ts
│       │   ├── repositories/
│       │   │   └── messages.repository.ts
│       │   └── services/
│       │       └── messages.service.ts
│       │
│       ├── direct-chat/            # Direct chat (1-1) WebSocket
│       │   ├── direct-chat.module.ts
│       │   └── direct-chat.gateway.ts
│       │
│       └── group-chat/             # Group chat WebSocket
│           ├── group-chat.module.ts
│           ├── group-chat.controller.ts
│           ├── group-chat.gateway.ts
│           ├── decorators/
│           │   └── group-auth.decorators.ts
│           ├── domain/
│           │   ├── group.entity.ts
│           │   ├── member.entity.ts
│           │   └── interfaces/
│           │       └── group-repository.interface.ts
│           ├── dto/
│           │   ├── add-member.dto.ts
│           │   ├── change-role.dto.ts
│           │   ├── create-group.dto.ts
│           │   └── update-group.dto.ts
│           ├── guards/
│           │   └── group-permission.guard.ts
│           ├── repositories/
│           │   └── group.repository.ts
│           ├── services/
│           │   └── group-chat.service.ts
│           └── use-cases/          # Use case pattern (Clean Architecture)
│               ├── add-member.usecase.ts
│               ├── change-role.usecase.ts
│               ├── create-group.usecase.ts
│               ├── join-group.usecase.ts
│               ├── leave-group.usecase.ts
│               ├── remove-member.usecase.ts
│               └── update-group.usecase.ts
│
├── test/                           # E2E tests
├── keys/                           # RSA keys storage
├── docker-compose.yml              # Docker configuration
├── nest-cli.json                   # NestJS CLI config
├── package.json                    # Dependencies
├── tsconfig.json                   # TypeScript config
└── .gitignore
```

---

## 🗄️ Database Schema (Prisma)

### **Models**

#### 1. **User**
```prisma
model User {
  id             String   @id @default(uuid())
  username       String   @unique
  hashedPassword String
  fullName       String
  email          String   @unique
  avatar         String?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  // Relations
  sentMessages     Message[]
  receivedMessages Message[]
  ownedGroups      Group[]
  groupMemberships GroupMember[]
  seenMessages     MessageSeen[]
  refreshTokens    RefreshToken[]
}
```

#### 2. **RefreshToken**
```prisma
model RefreshToken {
  id        String   @id @default(uuid())
  token     String   @unique
  userId    String
  ipAddress String?
  userAgent String?
  isRevoked Boolean  @default(false)
  expiresAt DateTime

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

#### 3. **Message**
```prisma
model Message {
  id          String      @id @default(uuid())
  type        MessageType @default(DIRECT)  // DIRECT | GROUP
  senderId    String
  receiverId  String?
  groupId     String?
  content     String?
  replyToId   String?
  attachments Json?
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  deletedAt   DateTime?   // Soft delete

  // Relations
  sender   User
  receiver User?
  group    Group?
  reply    Message?
  replies  Message[]
  seenBy   MessageSeen[]
}
```

#### 4. **MessageSeen**
```prisma
model MessageSeen {
  userId    String
  messageId String
  seenAt    DateTime @default(now())

  user    User
  message Message
}
```

#### 5. **Group**
```prisma
model Group {
  id          String   @id @default(uuid())
  name        String
  avatar      String?
  description String?
  ownerId     String
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  owner           User
  members         GroupMember[]
  messages        Message[]
  rolePermissions GroupRolePermission[]
}
```

#### 6. **GroupMember**
```prisma
model GroupMember {
  id       String     @id @default(uuid())
  groupId  String
  userId   String
  role     MemberRole @default(MEMBER)  // OWNER | CO_OWNER | MEMBER
  joinedAt DateTime   @default(now())

  group Group
  user  User
}
```

#### 7. **Permission** (Group permissions)
```prisma
model Permission {
  id          String   @id @default(uuid())
  name        String   @unique  // VD: "ADD_MEMBER", "DELETE_MESSAGE"
  description String?
  roles       GroupRolePermission[]
}
```

#### 8. **GroupRolePermission**
```prisma
model GroupRolePermission {
  id           String     @id @default(uuid())
  groupId      String
  role         MemberRole
  permissionId String
  isEnabled    Boolean    @default(true)

  group      Group
  permission Permission
}
```

### **Enums**
```prisma
enum MemberRole {
  OWNER
  CO_OWNER
  MEMBER
}

enum MessageType {
  DIRECT
  GROUP
}
```

---

## 🔌 API Endpoints

### **Authentication** (`/api/v1/auth`)
- `POST /login` - Đăng nhập
- `POST /signup` - Đăng ký
- `POST /refresh-token` - Refresh access token
- `POST /logout` - Đăng xuất
- `GET /me` - Lấy thông tin user hiện tại

### **Users** (`/api/v1/users`)
- `GET /all` - Lấy danh sách users
- `GET /search` - Tìm kiếm users
- `PATCH /profile` - Cập nhật profile
- `PATCH /upload-avatar` - Upload avatar

### **Messages** (`/api/v1/messages`)
- `GET /users` - Lấy danh sách users đã chat
- `GET /:id` - Lấy tin nhắn theo conversation
- `POST /upload` - Upload file đính kèm

### **Groups** (`/api/v1/groups`)
- `POST /create` - Tạo nhóm
- `GET /getGroups` - Lấy danh sách nhóm
- `GET /:id` - Lấy thông tin nhóm
- `PATCH /update/:id` - Cập nhật nhóm
- `DELETE /delete/:id` - Xóa nhóm
- `GET /:id/messages` - Lấy tin nhắn nhóm
- `POST /:id/addMembers` - Thêm thành viên
- `GET /:id/getMembers` - Lấy danh sách thành viên
- `DELETE /:id/deleteMembers/:memberId` - Xóa thành viên
- `PATCH /:id/changeRole/:memberId` - Thay đổi role

---

## 🔌 WebSocket Events

### **Direct Chat Gateway**
#### Client → Server:
- `entering` - Tham gia phòng chat 1-1
- `send-message` - Gửi tin nhắn
- `seen-message` - Đánh dấu đã đọc
- `typing-start` - Bắt đầu nhập
- `typing-stop` - Dừng nhập

#### Server → Client:
- `receive-message` - Nhận tin nhắn mới
- `message-seen` - Tin nhắn đã được đọc
- `user-typing` - User đang nhập
- `user-stopped-typing` - User dừng nhập

### **Group Chat Gateway**
#### Client → Server:
- `join-group` - Tham gia nhóm
- `leave-group` - Rời nhóm
- `send-group-message` - Gửi tin nhắn nhóm
- `seen-group-message` - Đánh dấu đã đọc
- `group-typing-start` - Bắt đầu nhập (nhóm)
- `group-typing-stop` - Dừng nhập (nhóm)
- `group-created` - Nhóm được tạo
- `group-deleted` - Nhóm bị xóa

#### Server → Client:
- `new-group-message` - Tin nhắn nhóm mới
- `group-message-seen` - Tin nhắn đã được đọc
- `member-typing` - Thành viên đang nhập
- `member-stopped-typing` - Thành viên dừng nhập

---

## ⚙️ Cấu hình & Environment Variables

### **Application**
- `NODE_ENV` - development | production | test
- `PORT` - Port server (default: 3000)
- `API_PREFIX` - API prefix (default: "api")
- `API_DEFAULT_VERSION` - API version (default: 1)
- `API_URL` - URL server
- `CLIENT_URL` - URL frontend

### **Database**
- `DATABASE_URL` - PostgreSQL connection string

### **JWT**
- `JWT_KEY_DIRECTORY` - Thư mục chứa RSA keys
- `JWT_PRIVATE_ACCESS` - Private key cho access token
- `JWT_PUBLIC_ACCESS` - Public key cho access token
- `JWT_PRIVATE_REFRESH` - Private key cho refresh token
- `JWT_PUBLIC_REFRESH` - Public key cho refresh token
- `ACCESS_TOKEN_EXPIRES_IN` - Thời gian hết hạn access token (seconds)
- `REFRESH_TOKEN_EXPIRES_IN` - Thời gian hết hạn refresh token (seconds)

### **Swagger**
- `SWAGGER_TITLE` - Tiêu đề Swagger
- `SWAGGER_DESCRIPTION` - Mô tả Swagger
- `SWAGGER_VERSION` - Version Swagger
- `SWAGGER_UI_PATH` - Path Swagger UI (default: "docs")

### **Cloudinary**
- Environment variables cho Cloudinary (cloud storage)

---

## 🏗️ Kiến trúc & Design Patterns

### **Clean Architecture**
- **Domain Layer**: Entities, Interfaces
- **Use Cases**: Business logic (group-chat module)
- **Infrastructure**: Repositories, Prisma
- **Presentation**: Controllers, Gateways, DTOs

### **Dependency Injection**
- Sử dụng NestJS DI container
- Interface-based programming (Repository pattern)

### **Guard & Middleware**
- **JwtGuard**: Xác thực JWT (global)
- **PermissionGuard**: Kiểm tra quyền
- **GroupPermissionGuard**: Kiểm tra quyền nhóm
- **SocketAuthGuard**: Xác thực WebSocket
- **LoggerMiddleware**: Log requests
- **Helmet**: Security headers
- **Compression**: Response compression

### **Exception Handling**
- **ApiExceptionFilter**: HTTP exception filter (global)
- **WsExceptionFilter**: WebSocket exception filter

### **Validation**
- **ApiValidationPipe**: DTO validation (global)
- **class-validator**: Decorator-based validation
- **class-transformer**: Object transformation

### **Configuration**
- Environment validation với class-validator
- Type-safe configuration service

---

## 🐳 Docker Configuration

```yaml
services:
  postgres:
    image: postgres:17
    container_name: realtime-chat-db
    ports:
      - "5430:5432"
    environment:
      POSTGRES_USER: postgredb
      POSTGRES_PASSWORD: postgredb
      POSTGRES_DB: realtime_chat
```

---

## 📦 Scripts

```json
{
  "build": "nest build",
  "start": "nest start",
  "start:dev": "nest start --watch",
  "start:prod": "node dist/src/main.js",
  "lint": "eslint \"{src,apps,libs,test}/**/*.ts\" --fix",
  "format": "prettier --write \"src/**/*.ts\" \"test/**/*.ts\"",
  "test": "jest",
  "test:watch": "jest --watch",
  "test:cov": "jest --coverage",
  "test:e2e": "jest --config ./test/jest-e2e.json",
  "prisma:generate": "prisma generate",
  "prisma:migrate": "prisma migrate dev",
  "prisma:seed": "prisma db seed",
  "prisma:studio": "prisma studio",
  "prisma:reset": "prisma migrate reset"
}
```

---

## 🔐 Security Features

1. **JWT Authentication** với RSA keys (public/private)
2. **Refresh Token** mechanism với revocation support
3. **Password Hashing** với bcrypt
4. **Helmet** - Security headers
5. **CORS** configuration
6. **WebSocket Authentication** với JWT
7. **Role-based Access Control** (RBAC) cho groups
8. **Soft Delete** cho messages

---

## 📊 Key Features

1. ✅ **Real-time Chat** (1-1 và nhóm) qua Socket.IO
2. ✅ **Authentication & Authorization** với JWT
3. ✅ **Group Management** với role-based permissions
4. ✅ **Message Attachments** (upload file/ảnh qua Cloudinary)
5. ✅ **Typing Indicators** (real-time)
6. ✅ **Message Seen Status** (đã đọc/chưa đọc)
7. ✅ **Soft Delete** cho messages
8. ✅ **Reply to Messages**
9. ✅ **User Search**
10. ✅ **Swagger API Documentation**
11. ✅ **Clean Architecture** với Use Cases pattern
12. ✅ **Repository Pattern** với Dependency Injection

---

## 🚀 Deployment & Scalability

### **Sẵn sàng cho Scale**
- Redis adapter cho Socket.IO (horizontal scaling)
- Prisma connection pooling
- PostgreSQL with pg driver adapter

### **Production Ready**
- Environment validation
- Error handling
- Logging middleware
- Compression
- Security headers
- CORS configuration

---

**Tạo bởi**: Rovo Dev  
**Ngày**: 2026-02-12
