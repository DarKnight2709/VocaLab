
const API_ROUTES = {
  AUTH: {
    LOGIN: "v1/auth/login",
    SIGNUP: "v1/auth/signup",
    LOGOUT: "v1/auth/logout",
    ME: "v1/auth/me",
    REFRESH_TOKEN: "v1/auth/refresh-token",
    CHANGE_PASSWORD: "v1/auth/change-password",
  },
  USER: {
    PROFILE: "v1/users/profile",
    SEARCH: "v1/users/search",
    UPLOAD_AVATAR: "v1/users/upload-avatar",
    GET_USERS: "v1/users/all",
  },
  GROUP: {
    CREATE: "v1/groups/create",
    GET_ALL: "v1/groups/getGroups",
    INFO: (groupId: string) => `v1/groups/${groupId}`,
    UPDATE: (groupId: string) => `v1/groups/update/${groupId}`,
    DELETE: (groupId: string) => `v1/groups/delete/${groupId}`,
    ADD_MEMBERS: (groupId: string) => `v1/groups/${groupId}/addMembers`,
    GET_MEMBERS: (groupId: string) => `v1/groups/${groupId}/getMembers`,
    DELETE_MEMBER: (groupId: string, memberId: string) => `v1/groups/${groupId}/deleteMembers/${memberId}`,
    CHANGE_ROLE: (groupId: string, memberId: string) => `v1/groups/${groupId}/changeRole/${memberId}`,
    GET_MESSAGES: (groupId: string) => `v1/groups/${groupId}/messages`,
    UPLOAD_AVATAR: "v1/messages/upload",
  },
  MESSAGE: {
    GET_USERS: "v1/messages/users",
    GET_MESSAGES: (friendId: string) => `v1/messages/${friendId}`,
  },
};

export default API_ROUTES;
