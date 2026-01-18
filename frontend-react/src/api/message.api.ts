import { api } from '../shared/lib/api'

export const messageAPI = {
  getUsers: () => api.get('/messages/users'),
  getMessages: (friendId: string) => api.get(`/messages/${friendId}`),
}
