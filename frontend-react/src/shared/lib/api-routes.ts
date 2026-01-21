

const API_ROUTES = {
  AUTH: {
    LOGIN: "/auth/login",
    SIGNUP: "/auth/signup",
    LOGOUT: "/auth/logout",
    ME: "/auth/me",
    UPDATE_PROFILE: "/users/update",
    CHANGE_PASSWORD: "/auth/change-password",
  },
  USER: {
    SEARCH: "/users/search",
  },
  GROUP: {
    CREATE: "/groups/create",
    GET_ALL: "/groups/getGroups",
    INFO: (groupId: string) => `/groups/${groupId}`,
    UPDATE: (groupId: string) => `/groups/update/${groupId}`,
    DELETE: (groupId: string) => `/groups/delete/${groupId}`,
    ADD_MEMBERS: (groupId: string) => `/groups/${groupId}/addMembers`,
    GET_MEMBERS: (groupId: string) => `/groups/${groupId}/getMembers`,
    DELETE_MEMBER: (groupId: string, memberId: string) => `/groups/${groupId}/deleteMembers/${memberId}`,
    CHANGE_ROLE: (groupId: string, memberId: string) => `/groups/${groupId}/changeRole/${memberId}`,
    GET_MESSAGES: (groupId: string) => `/groups/${groupId}/messages`,
    UPLOAD_AVATAR: "/messages/upload",
  },
  MESSAGE: {
    GET_USERS: "/messages/users",
    GET_MESSAGES: (friendId: string) => `/messages/${friendId}`,
    UPLOAD: "/messages/upload",
  },
};

export default API_ROUTES;
