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
    ME_FOLLOWING: (userId: string) => `v1/users/${userId}/me/following`,
    getContentBy: (userId: string, type: ContentTab) => `v1/users/${userId}/${type}`,
    STATS: (userId: string) => `v1/users/${userId}/stats`,

    FOLLOW: (userId: string) => `v1/users/${userId}/follow`,
    UNFOLLOW: (userId: string) => `v1/users/${userId}/unfollow`,
    MY_SOCIALS: "v1/users/me/socials",
    CREATE_SOCIAL: "v1/users/me/socials",
    UPDATE_SOCIAL: (id: string) => `v1/users/me/socials/${id}`,
    DELETE_SOCIAL: (id: string) => `v1/users/me/socials/${id}`,
  },
  GROUP: {
    CREATE: "v1/groups/create",
    GET_ALL: "v1/groups/getGroups",
    INFO: (groupId: string) => `v1/groups/${groupId}`,
    UPDATE: (groupId: string) => `v1/groups/update/${groupId}`,
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
    VOTE_COMMENT: (commentId: string) => `v1/blogs/comments/${commentId}/vote`
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
};

export default API_ROUTES;
