import { createBrowserRouter, RouterProvider } from 'react-router'
import { Toaster } from 'sonner'
import { ReactQueryProvider } from '@/shared/components/ReactQueryProvider'
import AuthGuard from '@/features/auth/components/AuthGuard'
import LoginPage from '@/features/auth/pages/LoginPage'
import MainLayout from './shared/layout/MainLayout'
import ErrorBoundary from './shared/components/ErrorBoundary'
import NotFoundPage from './shared/pages/NotFoundPage'
import GlobalLoadingProvider from './shared/components/GlobalLoading'
import { authLoader } from './features/auth/AuthLoader'
import ROUTES from './shared/lib/routes'
import BlogPage from './shared/pages/BlogPage'


const router = createBrowserRouter([
  {
    loader: authLoader,
    element: <AuthGuard />,
    children: [
      {
        path: ROUTES.HOME.url,
        element: <MainLayout />,
        children: [

          {
            path: ROUTES.BLOG.url,
            element: <BlogPage />,
          },
        ]
      }
    ]
  },
  {
    path: ROUTES.LOGIN.url,
    element: (
      <ErrorBoundary>
        <LoginPage />
      </ErrorBoundary>
    )
  },
  {
    path: '*',
    element: (
      <ErrorBoundary>
        <NotFoundPage />
      </ErrorBoundary>
    )
  }
])

export default function App() {
  return (
    <ReactQueryProvider>
      <GlobalLoadingProvider>
          <RouterProvider router={router} />
      </GlobalLoadingProvider>
      <Toaster position='top-right' richColors theme='light' />
    </ReactQueryProvider>
  )
}
