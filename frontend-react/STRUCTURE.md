# Chat Feature Structure & Refactor Guide

## 1. Component Tree

```
ChatView (container)
├── ChatSidebar (sidebar: search, tabs, user/group list)
└── ChatArea (main chat area, chỉ render khi đã chọn user/group)
    ├── ChatHeader (thông tin user/group, nút back/info)
    ├── MessageList (danh sách tin nhắn)
    └── MessageInput (ô nhập tin nhắn)
```

## 2. Custom Hooks
- `useChatData`: Quản lý users, groups, messages, loading, selectedUser, selectedGroup, v.v.
- `useChatSocket`: Quản lý socket, emit/receive các sự kiện.

## 3. API Layer
- Tất cả endpoint được định nghĩa ở `src/shared/lib/api-routes.ts`.
- Chỉ sử dụng TanStack Query để fetch dữ liệu qua các custom hook như `useGroupsQuery`, `useGroupMessagesQuery`, `useUsersQuery`, ...

## 4. Thư mục đề xuất
```
features/chat/
  components/
    ChatView.tsx
    ChatSidebar.tsx
    ChatArea.tsx
    ChatHeader.tsx
    MessageList.tsx
    MessageInput.tsx
    GroupCreateDialog.tsx
    GroupInfoDialog.tsx
  hooks/
    useChatData.ts
    useChatSocket.ts
    useGroupsQuery.ts
    useGroupMessagesQuery.ts
    useUsersQuery.ts
  api/
    (không cần group.api.ts, message.api.ts nữa)
  types.ts
  utils.ts
```

## 5. Nguyên tắc
- Mỗi component chỉ làm 1 việc.
- UI component không fetch API, không xử lý socket.
- Truyền props tối giản, nếu cần dùng context hoặc custom hook.

## 6. Giải thích flow
- ChatView quản lý state tổng, truyền props cho ChatSidebar và ChatArea.
- ChatSidebar chỉ lo sidebar, khi chọn user/group gọi callback.
- ChatArea nhận selectedUser/selectedGroup, messages, v.v. từ ChatView, render các thành phần con.
- MessageList chỉ nhận messages, myId, users (để lấy avatar), render danh sách tin nhắn.
- MessageInput nhận onSend, messageText, onTyping, v.v.

## 7. Hooks mẫu
```ts
// useGroupsQuery.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/shared/lib/api';
import API_ROUTES from '@/shared/lib/api-routes';

export function useGroupsQuery() {
  return useQuery({
    queryKey: ['groups'],
    queryFn: async () => {
      const res = await api.get(API_ROUTES.GROUP.GET_ALL);
      return res.data?.groups || [];
    },
  });
}
```

## 8. State & Props chính
- `selectedUser`, `selectedGroup`, `messages`, `groupMessages`, `myId`, ...
- Được quản lý ở ChatView và truyền xuống các component con.

---
Bạn chỉ cần làm theo cấu trúc này, code sẽ rõ ràng, dễ mở rộng và bảo trì!
