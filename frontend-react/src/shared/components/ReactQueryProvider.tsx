import envConfig from '@/shared/config/envConfig'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import type { ReactNode } from 'react'

// instance chính của react query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 phút: dữ liệu được coi là tươi 
      gcTime: 10 * 60 * 1000,   //10 phút: dữ liệu bị xóa khởi cache
      retry: false,             // không tự động retry khi query lỗi
      refetchOnMount: true,    // Tự động tải lại khi vào trang mà dữ liệu đã cũ (stale)
      refetchOnWindowFocus: true, // Tự động tải lại khi quay lại Tab mà dữ liệu đã cũ (stale)
      refetchOnReconnect: true  // refetch khi mạng kết nối lại
    },
    mutations: {  
      retry: false        // không retry khi mutation lỗi
    }
  }
})

interface ReactQueryProviderProps {
  children: ReactNode
}

// provider toàn cục cho React query
// đặc ở cấp cao nhất
// tất cả component trong app đều có thể sử dụng các hook (useQuery, useMutation, useQueryClient).

export function ReactQueryProvider({ children }: ReactQueryProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {envConfig.VITE_ENV !== 'production' && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  )
}

export { queryClient }