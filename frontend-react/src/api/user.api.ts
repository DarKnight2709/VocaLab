import { api } from '../shared/lib/api'

export type UpdateAccountPayload = {
  username: string
  fullName: string
  email: string
}

export const userAPI = {
  updateAccount: (payload: UpdateAccountPayload) => api.patch('/users/update', payload),
  uploadAvatar: (file: File) => {
    const formData = new FormData()
    formData.append('avatar', file)
    return api.patch('/users/upload-avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
  searchs: (keyword: string) => api.get(`/users/search?keyword=${encodeURIComponent(keyword)}`),
}
