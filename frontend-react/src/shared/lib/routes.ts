const ROUTES = {
  HOME: {
    title: "Trang chủ",
    url: "/",
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
  LOGIN: {
    title: "Đăng nhập",
    url: "/login",
  },
  PROFILE: {
    title: "Trang cá nhân",
    url: "/profile/:fullName",
  },
};

export default ROUTES;
