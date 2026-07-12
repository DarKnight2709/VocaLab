// mục địch: Đảm bảo tất cả biến môi trường (.env) của dự án đều đúng định dạng

import { z } from 'zod'

// định nghĩa schema cho biến môi trường
const envSchema = z.object({
  VITE_API_URL: z.string().url('Invalid API URL'),
  VITE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  VITE_SOCKET_URL: z.string().url('Invalid Socket URL'),
  VITE_GOOGLE_AUTH_URL: z.string().url('Invalid Google Auth URL'),
  VITE_GOOGLE_CLIENT_ID: z.string().min(1, 'Google Client ID is required'),
  VITE_GIPHY_API_KEY: z.string().min(1, 'Giphy API Key is required'),
  VITE_FIREBASE_API_KEY: z.string().min(1, 'Firebase API Key is required'),
  VITE_FIREBASE_AUTH_DOMAIN: z.string().min(1, 'Firebase Auth Domain is required'),
  VITE_FIREBASE_PROJECT_ID: z.string().min(1, 'Firebase Project ID is required'),
  VITE_FIREBASE_MESSAGING_SENDER_ID: z.string().min(1, 'Firebase Messaging Sender ID is required'),
  VITE_FIREBASE_APP_ID: z.string().min(1, 'Firebase App ID is required'),
  VITE_FIREBASE_VAPID_KEY: z.string().min(1, 'Firebase VAPID Key is required'),
})

// tự động tạo type TS từ schema Zod -> không phải viết lại type thủ công.
type Env = z.infer<typeof envSchema>

// hàm lấy biến môi trường và validate.
function validateEnv(): Env {
  const env = {
    VITE_API_URL: import.meta.env.VITE_API_URL,
    VITE_ENV: import.meta.env.VITE_ENV,
    VITE_SOCKET_URL: import.meta.env.VITE_SOCKET_URL,
    VITE_GOOGLE_AUTH_URL: import.meta.env.VITE_GOOGLE_AUTH_URL,
    VITE_GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID,
    VITE_GIPHY_API_KEY: import.meta.env.VITE_GIPHY_API_KEY,
    VITE_FIREBASE_API_KEY: import.meta.env.VITE_FIREBASE_API_KEY,
    VITE_FIREBASE_AUTH_DOMAIN: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    VITE_FIREBASE_PROJECT_ID: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    VITE_FIREBASE_MESSAGING_SENDER_ID: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    VITE_FIREBASE_APP_ID: import.meta.env.VITE_FIREBASE_APP_ID,
    VITE_FIREBASE_VAPID_KEY: import.meta.env.VITE_FIREBASE_VAPID_KEY,
  }

  try {
    // validate bằng Zod -> hợp lệ -> return dữ liệu dạng chuẩn
    //                   -> sai/thiếu -> Zod ném lỗi
    return envSchema.parse(env)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = Object.keys(error.flatten().fieldErrors)
      throw new Error(`❌ Invalid environment variables: ${missingVars.join(', ')}\n${error.message}`)
    }
    throw error
  }
}

export default validateEnv()

