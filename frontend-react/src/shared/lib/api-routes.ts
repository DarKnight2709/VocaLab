import type { ContentTab } from "../enums/ContentTab.enum";

const API_ROUTES = {
  AUTH: {
    LOGIN: "v1/auth/login",
    SIGNUP: "v1/auth/signup",
    LOGOUT: "v1/auth/logout",
    GOOGLE: "v1/auth/google",
    ME: "v1/auth/me",
    REFRESH_TOKEN: "v1/auth/refresh-token",
    CHANGE_PASSWORD: "v1/auth/change-password",
    SET_PASSWORD: "v1/auth/set-password",
    TWO_FACTOR_AUTH_GENERATE: "v1/auth/two-factor-auth/generate",
    TWO_FACTOR_AUTH_VERIFY: "v1/auth/two-factor-auth/verify",
    TWO_FACTOR_AUTH_LOGIN: "v1/auth/two-factor-auth/login",
    TWO_FACTOR_AUTH_DISABLE: "v1/auth/two-factor-auth/disable",
  },
  USER: {
    PROFILE: "v1/users/profile",
    DELETE_ACCOUNT: "v1/users/profile",
    SEARCH: "v1/users/search",
    UPLOAD_AVATAR: "v1/users/upload-avatar",
    GET_USERS: "v1/users/all",
    BY_USERNAME: (username: string) => `v1/users/by-username/${username}`,
    getContentBy: (userId: string, type: ContentTab) =>
      `v1/users/${userId}/${type}`,
    BLOCK_USER: (userId: string) => `v1/users/${userId}/block`,
    GET_BLOCKED_USERS: (userId: string) => `v1/users/${userId}/blocked`,
    UNBLOCK_USER: (userId: string) => `v1/users/${userId}/unblock`,
    FOLLOW: (userId: string) => `v1/users/${userId}/follow`,
    UNFOLLOW: (userId: string) => `v1/users/${userId}/unfollow`,
    MY_SOCIALS: "v1/users/me/socials",
    CREATE_SOCIAL: "v1/users/me/socials",
    UPDATE_SOCIAL: (id: string) => `v1/users/me/socials/${id}`,
    DELETE_SOCIAL: (id: string) => `v1/users/me/socials/${id}`,
  },
  GROUP: {
    CREATE: "v1/groups/create",
    INFO: (groupId: string) => `v1/groups/${groupId}`,
    UPDATE: (groupId: string) => `v1/groups/update/${groupId}`,
    JOIN: (groupId: string) => `v1/groups/join/${groupId}`,
    UPDATE_VISIBILITY: (groupId: string) => `v1/groups/${groupId}/visibility`,
    DELETE: (groupId: string) => `v1/groups/delete/${groupId}`,
    TRANSFER_OWNERSHIP: (groupId: string) =>
      `v1/groups/${groupId}/transferOwnership`,
    ADD_MEMBERS: (groupId: string) => `v1/groups/${groupId}/addMembers`,
    GET_MEMBERS: (groupId: string) => `v1/groups/${groupId}/getMembers`,
    DELETE_MEMBER: (groupId: string, memberId: string) =>
      `v1/groups/${groupId}/deleteMembers/${memberId}`,
    CHANGE_ROLE: (groupId: string, memberId: string) =>
      `v1/groups/${groupId}/changeRole/${memberId}`,
    UPDATE_ROLE_PERMISSION: (groupId: string) =>
      `v1/groups/${groupId}/rolePermissions`,
    GET_MESSAGES: (groupId: string) => `v1/groups/${groupId}/messages`,
    LEAVE: (groupId: string) => `v1/groups/leave/${groupId}`,
    GET_AVAILABLE_PERMISSIONS: "v1/groups/permissions/all",
  },
  MESSAGE: {
    GET_USERS: "v1/messages/users",
    GET_GROUPS: "v1/messages/groups",
    GET_MESSAGES: (friendId: string) => `v1/messages/${friendId}`,
  },
  UPLOAD: {
    FILE: "v1/upload",
  },
  BLOG: {
    LIST: "v1/blogs",
    MY_LIST: "v1/blogs/me/list",
    DETAIL: (id: string) => `v1/blogs/${id}`,
    CREATE: "v1/blogs",
    UPDATE: (id: string) => `v1/blogs/${id}`,
    DELETE: (id: string) => `v1/blogs/${id}`,
    VOTE: (id: string) => `v1/blogs/${id}/vote`,
    ADD_COMMENT: (id: string) => `v1/blogs/${id}/comments`,
    UPDATE_COMMENT: (commentId: string) => `v1/blogs/comments/${commentId}`,
    DELETE_COMMENT: (commentId: string) => `v1/blogs/comments/${commentId}`,
    EDIT_COMMENT: (commentId: string) => `v1/blogs/comments/${commentId}`,
    REPLY_COMMENT: (commentId: string) =>
      `v1/blogs/comments/${commentId}/reply`,
    VOTE_COMMENT: (commentId: string) => `v1/blogs/comments/${commentId}/vote`,
  },
  GRAMMAR: {
    LIST: "v1/grammar",
    CATEGORIES: "v1/grammar/categories",
    DETAIL: (id: string) => `v1/grammar/${id}`,
    CREATE: "v1/grammar",
    UPDATE: (id: string) => `v1/grammar/${id}`,
    DELETE: (id: string) => `v1/grammar/${id}`,
  },
  VOCABULARY: {
    COLLECTIONS: "v1/vocabulary/collections",
    COLLECTION_DETAIL: (id: string) => `v1/vocabulary/collections/${id}`,
    COLLECTION_CARDS: (id: string) => `v1/vocabulary/collections/${id}/cards`,
    CREATE_COLLECTION: "v1/vocabulary/collections",
    UPDATE_COLLECTION: (id: string) => `v1/vocabulary/collections/${id}`,
    DELETE_COLLECTION: (id: string) => `v1/vocabulary/collections/${id}`,
    CARD_TYPES: "v1/vocabulary/card-types",
    CARD_TYPE_DETAILS: (id: string) => `v1/vocabulary/card-types/${id}`,
    CREATE_CARD_TYPE: "v1/vocabulary/card-types",
    UPDATE_CARD_TYPE: (id: string) => `v1/vocabulary/card-types/${id}`,
    DELETE_CARD_TYPE: (id: string) => `v1/vocabulary/card-types/${id}`,
    CREATE_CARD: (collectionId: string) =>
      `v1/vocabulary/collections/${collectionId}/cards`,
    DELETE_CARD: (cardId: string) => `v1/vocabulary/cards/${cardId}`,
    IMPORT_CARDS: (collectionId: string) =>
      `v1/vocabulary/collections/${collectionId}/import`,
    ADD_CARD: (collectionId: string) =>
      `v1/vocabulary/collections/${collectionId}/cards`,
    UPDATE_CARD: (cardId: string) => `v1/vocabulary/cards/${cardId}`,
    // IMPORT_VOCABULARY: "v1/vocabulary/collections/${collectionId}/import",
  },

  SETTING: {
    ALLOW_FOLLOW: "v1/settings/allow-follow",
    MESSAGE_SCOPE: "v1/settings/message-scope",
    FOLLOWERS_TAB_VISIBILITY: "v1/settings/followers-tab-visibility",
    FOLLOWING_TAB_VISIBILITY: "v1/settings/following-tab-visibility",
    FRIEND_TAB_VISIBILITY: "v1/settings/friend-tab-visibility",
    NOTIFICATION: {
      BASE: "v1/settings/notifications",
      CHAT_MESSAGES: "v1/settings/notifications/chat-messages",
      COMMENTS: "v1/settings/notifications/comments",
      UPVOTES: "v1/settings/notifications/upvotes",
      NEW_FOLLOWERS: "v1/settings/notifications/new-followers",
      ACTIVITY_FROM_FOLLOWED:
        "v1/settings/notifications/activity-from-followed",
    },
    REMINDER: {
      BASE: "v1/settings/reminders",
      BY_ID: (id: string) => `v1/settings/reminders/${id}`,
      TOGGLE: (id: string) => `v1/settings/reminders/${id}/toggle`,
    },
    DAILY_GOAL: "v1/settings/daily-goal",
  },

  NOTIFICATION: {
    LIST: "v1/notifications",
    UNREAD_COUNT: "v1/notifications/unread-count",
    MARK_READ: (id?: string) =>
      id ? `v1/notifications/read/${id}` : `v1/notifications/read`,
  },

  DEVICES: {
    REGISTER: "v1/devices/register",
    UNREGISTER: "v1/devices/unregister",
  },
  PROGRESS: {
    HEARTBEAT: "v1/progress/heartbeat",
    STATS: "v1/progress/stats",
  },

  SEARCH: {
    BASE: (type: string) => `v1/search/${type}`,
    SUGGESTION: "v1/search/suggestion",
    SIDEBAR: "v1/search/sidebar",
  },
};

export default API_ROUTES;
