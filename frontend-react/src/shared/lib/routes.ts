const ROUTES = {
  HOME: {
    title: "Home",
    url: "/",
  },
  AUTH_2FA: {
    title: "Two-factor authentication",
    url: "/auth/two-factor",
  },
  BLOG: {
    title: "Blog",
    url: "/blogs",
  },
  BLOG_DETAIL: {
    title: "Post details",
    url: "/blogs/:id",
  },
  BLOG_CREATE: {
    title: "Create post",
    url: "/blogs/create",
  },
  BLOG_EDIT: {
    title: "Edit post",
    url: "/blogs/:id/edit",
  },
  GRAMMAR: {
    title: "Grammar",
    url: "/grammar",
  },
  VOCABULARY: {
    title: "Vocabulary",
    url: "/vocabulary",
  },
  VOCABULARY_COLLECTION: {
    title: "Vocabulary collection details",
    url: "/vocabulary/:collectionId",
  },
  VOCABULARY_ADD_CARD: {
    title: "Create new card",
    url: "/vocabulary/:collectionId/add-card",
  },
  VOCABULARY_CARD_TYPES: {
    title: "Card type management",
    url: "/vocabulary/card-types",
  },
  VOCABULARY_CARD_TYPE_PREVIEW: {
    title: "Card type details",
    url: "/vocabulary/card-types/:cardTypeId",
  },
  CHAT: {
    title: "Messages",
    url: "/chat",
  },
  SEARCH: {
    title: "Search",
    url: "/search",
  },
  ME_SETTING: {
    title: "Settings",
    url: "/setting/me",
  },
  ME_NOTIFICATION: {
    title: "Notifications",
    url: "/notification/me",
  },
  LOGIN: {
    title: "Login",
    url: "/login",
  },
  AUTH_CALLBACK: {
    title: "Signing in",
    url: "/auth/callback",
  },
  PROFILE: {
    title: "Profile",
    url: "/profile/:username",
  },
};

export default ROUTES;
