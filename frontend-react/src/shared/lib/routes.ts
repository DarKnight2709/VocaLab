const ROUTES = {
  HOME: {
    title: "Trang chủ",
    url: "/",
  },
  AUTH_2FA: {
    title: "Xác thực 2 yếu tố",
    url: "/auth/two-factor",
  },
  BLOG: {
    title: "Blog",
    url: "/blogs",
  },
  BLOG_DETAIL: {
    title: "Chi tiết bài viết",
    url: "/blogs/:id",
  },
  BLOG_CREATE: {
    title: "Viết bài mới",
    url: "/blogs/create",
  },
  BLOG_EDIT: {
    title: "Chỉnh sửa bài viết",
    url: "/blogs/:id/edit",
  },
  GRAMMAR: {
    title: "Ngữ pháp",
    url: "/grammar",
  },
  VOCABULARY: {
    title: "Từ vựng",
    url: "/vocabulary",
  },
  VOCABULARY_COLLECTION: {
    title: "Chi tiết bộ từ vựng",
    url: "/vocabulary/:collectionId",
  },
  VOCABULARY_ADD_CARD: {
    title: "Tạo card mới",
    url: "/vocabulary/:collectionId/add-card",
  },
  VOCABULARY_CARD_TYPES: {
    title: "Quản lý kiểu thẻ",
    url: "/vocabulary/card-types",
  },
  VOCABULARY_CARD_TYPE_PREVIEW: {
    title: "Xem chi tiết kiểu thẻ",
    url: "/vocabulary/card-types/:cardTypeId",
  },
  CHAT: {
    title: "Tin nhắn",
    url: "/chat",
  },
  SEARCH: {
    title: "Tìm kiếm",
    url: "/search",
  },
  ME_SETTING: {
    title: "Cài đặt",
    url: "/setting/me",
  },
  LOGIN: {
    title: "Đăng nhập",
    url: "/login",
  },
  AUTH_CALLBACK: {
    title: "Đang xử lý đăng nhập",
    url: "/auth/callback",
  },
  PROFILE: {
    title: "Trang cá nhân",
    url: "/profile/:username",
  },
};

export default ROUTES;
