import { api } from '../shared/lib/api'

export const groupAPI = {
  createGroup: (payload: unknown) => api.post('/groups/create', payload),
  getGroups: () => api.get('/groups/getGroups'),
  getInfoGroup: (groupId: string) => api.get(`/groups/${groupId}`),
  updateGroup: (groupId: string, payload: unknown) => api.patch(`/groups/update/${groupId}`, payload),
  deleteGroup: (groupId: string) => api.delete(`/groups/delete/${groupId}`),
  addMembers: (groupId: string, memberIds: string[]) => api.post(`/groups/${groupId}/addMembers`, { memberIds }),
  getMembers: (groupId: string) => api.get(`/groups/${groupId}/getMembers`),
  deleteMember: (groupId: string, memberId: string) => api.delete(`/groups/${groupId}/deleteMembers/${memberId}`),
  changeRole: (groupId: string, memberId: string, role: string) =>
    api.patch(`/groups/${groupId}/changeRole/${memberId}`, { newRole: role }),
  getGroupMessages: (groupId: string) => api.get(`/groups/${groupId}/messages`),
  uploadGroupAvatar: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/messages/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
}
