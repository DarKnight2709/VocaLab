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
  CHAT_TAB_USERS: {
    title: "Messages",
    url: "/chat/users",
  },
  CHAT_TAB_GROUPS: {
    title: "Messages",
    url: "/chat/groups",
  },
  CHAT_TAB_USERS_ID: {
    title: "Messages",
    url: "/chat/users/:id",
  },
  CHAT_TAB_GROUPS_ID: {
    title: "Messages",
    url: "/chat/groups/:id",
  },
  SEARCH: {
    title: "Search",
    url: "/search",
  },
  ME_SETTING: {
    title: "Settings",
    url: "/setting/me",
  },
  ME_SETTING_ACCOUNT: {
    title: "Account Settings",
    url: "/setting/me/account",
  },
  ME_SETTING_PREFERENCES: {
    title: "Preferences",
    url: "/setting/me/preferences",
  },
  ME_SETTING_PRIVACY: {
    title: "Privacy Settings",
    url: "/setting/me/privacy",
  },
  ME_SETTING_NOTIFICATIONS: {
    title: "Notification Settings",
    url: "/setting/me/notifications",
  },
  ME_SETTING_LEARNING: {
    title: "Learning Settings",
    url: "/setting/me/learning",
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
  STATS: {
    title: "Statistics",
    url: "/stats",
  },
};

export default ROUTES;
