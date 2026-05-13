import { createBrowserRouter, RouterProvider } from "react-router";
import { Toaster } from "sonner";
import { ReactQueryProvider } from "@/shared/components/ReactQueryProvider";
import AuthGuard from "@/features/auth/components/AuthGuard";
import LoginPage from "@/features/auth/pages/LoginPage";
import AuthCallback from "@/features/auth/pages/AuthCallback";
import MainLayout from "./shared/layout/MainLayout";
import ErrorBoundary from "./shared/components/ErrorBoundary";
import NotFoundPage from "./shared/pages/NotFoundPage";
import GlobalLoadingProvider from "./shared/components/GlobalLoading";
import { authLoader } from "./features/auth/AuthLoader";
import ROUTES from "./shared/lib/routes";
import BlogPage from "./features/blog/pages/BlogPage";
import BlogDetailPage from "./features/blog/pages/BlogDetailPage";
import BlogCreatePage from "./features/blog/pages/BlogCreatePage";
import ProfilePage from "./features/user/pages/ProfilePage";
import SettingPage from "./features/setting/pages/SettingPage";
import GrammarPage from "./features/grammar/pages/GrammarPage";
import VocabularyPage from "./features/vocabulary/pages/VocabularyPage";
import VocabularyCollectionPage from "./features/vocabulary/pages/VocabularyCollectionPage";
import VocabularyAddCardPage from "./features/vocabulary/pages/VocabularyAddCardPage";
import CardTypeManagementPage from "./features/vocabulary/pages/CardTypeManagementPage";
import CardTypePreviewPage from "./features/vocabulary/pages/CardTypePreviewPage";
import ChatPage from "./features/chat/pages/ChatPage";
import SearchPage from "./features/search/pages/SearchPage";
import { ThemeProvider, useTheme } from "./shared/components/ThemeProvider";
import TwoFactorAuthGuard from "./features/auth/components/TwoFactorAuthGuard";
import TwoFactorAuthPage from "./features/auth/pages/TwoFactorAuthPage";
import { twoFactorAuthLoader } from "./features/auth/TwoFactorAuthLoader";
import { useEffect } from "react";
import { useTranslation } from "./shared/hooks/useTranslation";

const router = createBrowserRouter([
  {
    loader: authLoader,
    element: <AuthGuard />,
    children: [
      {
        path: ROUTES.HOME.url,
        element: <MainLayout />,
        children: [
          { path: ROUTES.BLOG.url, element: <BlogPage /> },
          { path: ROUTES.BLOG_DETAIL.url, element: <BlogDetailPage /> },
          { path: ROUTES.BLOG_CREATE.url, element: <BlogCreatePage /> },
          { path: ROUTES.BLOG_EDIT.url, element: <BlogCreatePage /> },
          { path: ROUTES.GRAMMAR.url, element: <GrammarPage /> },
          { path: ROUTES.VOCABULARY.url, element: <VocabularyPage /> },
          {
            path: ROUTES.VOCABULARY_COLLECTION.url,
            element: <VocabularyCollectionPage />,
          },
          {
            path: ROUTES.VOCABULARY_ADD_CARD.url,
            element: <VocabularyAddCardPage />,
          },
          {
            path: ROUTES.VOCABULARY_CARD_TYPES.url,
            element: <CardTypeManagementPage />,
          },
          {
            path: ROUTES.VOCABULARY_CARD_TYPE_PREVIEW.url,
            element: <CardTypePreviewPage />,
          },
          { path: ROUTES.CHAT.url, element: <ChatPage /> },
          { path: ROUTES.SEARCH.url, element: <SearchPage /> },
          { path: ROUTES.PROFILE.url, element: <ProfilePage /> },
          { path: ROUTES.ME_SETTING.url, element: <SettingPage /> },
        ],
      },
    ],
  },
  {
    loader: twoFactorAuthLoader,
    element: <TwoFactorAuthGuard />,
    children: [
      {
        path: ROUTES.AUTH_2FA.url,
        element: (
          <ErrorBoundary>
            <TwoFactorAuthPage />
          </ErrorBoundary>
        ),
      },
    ],
  },
  {
    path: ROUTES.LOGIN.url,
    element: (
      <ErrorBoundary>
        <LoginPage />
      </ErrorBoundary>
    ),
  },
  {
    path: ROUTES.AUTH_CALLBACK.url,
    element: (
      <ErrorBoundary>
        <AuthCallback />
      </ErrorBoundary>
    ),
  },
  {
    path: "*",
    element: (
      <ErrorBoundary>
        <NotFoundPage />
      </ErrorBoundary>
    ),
  },
]);


function ThemedToaster() {
  const { theme } = useTheme();
  return (
    <Toaster
      position="top-right"
      richColors
      theme={theme === "system" ? "light" : theme}
    />
  );
}

function LanguageSync() {
  const { language } = useTranslation();

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return null;
}

export default function App() {
  return (
    <ReactQueryProvider>
      <GlobalLoadingProvider>
        <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
          <LanguageSync />
          <RouterProvider router={router} />
          <ThemedToaster />
        </ThemeProvider>
      </GlobalLoadingProvider>
    </ReactQueryProvider>
  );
}
