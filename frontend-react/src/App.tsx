import { createBrowserRouter, RouterProvider, Navigate } from "react-router";
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
import NotificationPage from "./features/notification/pages/NotificationPage";
import AccountSettingPage from "./features/setting/pages/AccountSettingPage";
import PrivacySettingPage from "./features/setting/pages/PrivacySettingPage";
import NotificationsSettingPage from "./features/setting/pages/NotificationsSettingPage";
import LearningSettingTab from "./features/setting/components/setting-tabs/LearningSettingTab";
import PreferencesSettingTab from "./features/setting/components/setting-tabs/PreferencesSettingTab";
import { ThemeProvider, useTheme } from "./shared/components/ThemeProvider";
import TwoFactorAuthGuard from "./features/auth/components/TwoFactorAuthGuard";
import TwoFactorAuthPage from "./features/auth/pages/TwoFactorAuthPage";
import { twoFactorAuthLoader } from "./features/auth/TwoFactorAuthLoader";
import { useEffect } from "react";
import { useTranslation } from "./shared/hooks/useTranslation";
import { StudyLayout } from "./shared/layout/StudyLayout";
import StatsPage from "./features/stats/pages/StatsPage";

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
          { path: ROUTES.STATS.url, element: <StatsPage /> },
          {
            element: <StudyLayout />,
            children: [
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
            ],
          },
          { path: ROUTES.CHAT_TAB_USERS.url, element: <ChatPage /> },
          { path: ROUTES.CHAT_TAB_GROUPS.url, element: <ChatPage /> },
          { path: ROUTES.CHAT_TAB_USERS_ID.url, element: <ChatPage /> },
          { path: ROUTES.CHAT_TAB_GROUPS_ID.url, element: <ChatPage /> },
          { path: ROUTES.SEARCH.url, element: <SearchPage /> },
          { path: ROUTES.PROFILE.url, element: <ProfilePage /> },
          {
            path: ROUTES.ME_SETTING.url,
            element: <SettingPage />,
            children: [
              {
                index: true,
                element: (
                  <Navigate to={ROUTES.ME_SETTING_ACCOUNT.url} replace />
                ),
              },
              {
                path: ROUTES.ME_SETTING_ACCOUNT.url,
                element: <AccountSettingPage />,
              },
              {
                path: ROUTES.ME_SETTING_PREFERENCES.url,
                element: <PreferencesSettingTab />,
              },
              {
                path: ROUTES.ME_SETTING_PRIVACY.url,
                element: <PrivacySettingPage />,
              },
              {
                path: ROUTES.ME_SETTING_NOTIFICATIONS.url,
                element: <NotificationsSettingPage />,
              },
              {
                path: ROUTES.ME_SETTING_LEARNING.url,
                element: <LearningSettingTab />,
              },
            ],
          },
          { path: ROUTES.ME_NOTIFICATION.url, element: <NotificationPage /> },
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
