// mục địch: Đảm bảo tất cả biến môi trường (.env) của dự án đều đúng định dạng

import { z } from 'zod'

// định nghĩa schema cho biến môi trường
const envSchema = z.object({
  VITE_API_URL: z.url('Invalid API URL'),
  VITE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  VITE_SOCKET_URL: z.url('Invalid Socket URL'),
})

// tự động tạo type TS từ schema Zod -> không phải viết lại type thủ công.
type Env = z.infer<typeof envSchema>

// hàm lấy biến môi trường và validate.
function validateEnv(): Env {
  const env = {
    VITE_API_URL: import.meta.env.VITE_API_URL,
    VITE_ENV: import.meta.env.VITE_ENV,
    VITE_SOCKET_URL: import.meta.env.VITE_SOCKET_URL
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

