import { useMemo, useState } from "react";
import { Navigate, useNavigate, useLocation } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import envConfig from "@/shared/config/envConfig";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  useLoginMutation,
  useSignUpMutation,
} from "@/features/auth/api/authService";
import {
  getLoginSchema,
  getSignUpSchema,
  type LoginBodyType,
  type SignUpBodyType,
} from "@/shared/validations/AuthSchema";
import ROUTES from "@/shared/lib/routes";
import { useAuthStore } from "../stores/authStore";
import { toast } from "sonner";
import { useTranslation } from "@/shared/hooks/useTranslation";

export default function LoginPage() {
  const isAuth = useAuthStore((state) => state.isAuth);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");

  // Lấy đường dẫn mà người dùng định truy cập trước khi bị redirect sang đây
  const from = location.state?.from || ROUTES.HOME.url;

  const loginMutation = useLoginMutation();
  const signUpMutation = useSignUpMutation();

  const loginForm = useForm<LoginBodyType>({
    resolver: zodResolver(getLoginSchema()),
    defaultValues: { email: "", password: "" },
  });

  const signupForm = useForm<SignUpBodyType>({
    resolver: zodResolver(getSignUpSchema()),
    defaultValues: { username: "", fullName: "", email: "", password: "" },
  });

  const googleAuthUrl = useMemo(
    () => `${envConfig.VITE_API_URL}/api/v1/auth/google`,
    [],
  );

  if (isAuth) {
    return <Navigate to={from} replace />;
  }

  async function handleLogin(data: LoginBodyType) {
    try {
      await loginMutation.mutateAsync({
        email: data.email,
        password: data.password,
      });

      const { isFirstFactorPassed } = useAuthStore.getState();
      if (isFirstFactorPassed) {
        navigate(ROUTES.AUTH_2FA.url, { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } catch (err: any) {
      toast.error(err?.data?.message || t("auth.loginFailed"));
    }
  }

  async function handleSignup(data: SignUpBodyType) {
    try {
      await signUpMutation.mutateAsync({
        username: data.username,
        password: data.password,
        fullName: data.fullName,
        email: data.email,
      });
      signupForm.reset();
      setActiveTab("login");
      loginForm.setValue("email", data.email);
    } catch (err: any) {
      toast.error(err?.data?.message || t("auth.signingUp"));
    }
  }

  return (
    <div className="flex min-h-dvh w-full bg-background font-sans">
      {/* Visual / Branding Side - Hidden on smaller screens */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-zinc-950 p-12 text-zinc-300 lg:flex">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>

        <div className="relative z-10 flex items-center gap-3">
          {/* Logo Placeholder */}
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-zinc-950 shadow-sm">
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight text-white">VocaLab</span>
        </div>

        <div className="relative z-10 space-y-6">
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-white drop-shadow-sm">
            Discover a <br />
            New World <br />
            of Vocabulary.
          </h1>
          <p className="max-w-md text-lg text-zinc-300 font-medium leading-relaxed drop-shadow-sm">
            Join thousands of learners elevating their language skills through collaborative, community-driven study.
          </p>
        </div>

        <div className="relative z-10 text-sm font-medium text-zinc-500">
          © {new Date().getFullYear()} VocaLab Inc. All rights reserved.
        </div>
      </div>

      {/* Form Side */}
      <div className="flex w-full flex-col items-center justify-center p-6 sm:p-10 lg:w-1/2 lg:p-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left space-y-2">
            <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-sm">
                 <svg className="h-5 w-5 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <span className="text-2xl font-bold tracking-tight text-foreground">VocaLab</span>
            </div>

            <h2 className="text-3xl font-extrabold tracking-tight text-foreground">
              {activeTab === "login" ? t("auth.signIn") : t("auth.signUp")}
            </h2>
            <p className="text-sm text-muted-foreground font-medium">
              {activeTab === "login" ? (
                <>
                  {t("auth.noAccount")}{" "}
                  <button
                    type="button"
                    className="font-bold text-primary hover:text-primary/80 hover:underline transition-all"
                    onClick={() => setActiveTab("signup")}
                  >
                    {t("auth.signUp")}
                  </button>
                </>
              ) : (
                <>
                  {t("auth.haveAccount")}{" "}
                  <button
                    type="button"
                    className="font-bold text-primary hover:text-primary/80 hover:underline transition-all"
                    onClick={() => setActiveTab("login")}
                  >
                    {t("auth.signIn")}
                  </button>
                </>
              )}
            </p>
          </div>

          <a
            href={googleAuthUrl}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-input bg-background px-4 py-3 text-sm font-semibold text-foreground shadow-sm transition-all hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <svg width="20" height="20" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.3 1.53 8.27 3.24l6.01-5.99C34.57 3.33 29.74 1 24 1 14.9 1 7.09 6.2 3.25 13.73l7.02 5.45C12.16 13.08 17.61 9.5 24 9.5z" />
              <path fill="#4285F4" d="M46.5 24.5c0-1.67-.15-2.85-.47-4.08H24v7.73h12.86c-.26 2.03-1.67 5.09-4.8 7.14l7.38 5.7C44.8 35.02 46.5 29.62 46.5 24.5z" />
              <path fill="#FBBC05" d="M10.27 28.18c-.5-1.48-.8-3.06-.8-4.68s.3-3.2.79-4.68l-7.02-5.45C1.85 16.15 1 20.17 1 23.5c0 3.33.85 7.35 2.24 10.13l7.03-5.45z" />
              <path fill="#34A853" d="M24 46c5.74 0 10.56-1.9 14.08-5.18l-7.38-5.7c-1.97 1.38-4.61 2.33-6.7 2.33-6.39 0-11.84-3.58-13.73-8.68l-7.02 5.45C7.09 41.8 14.9 46 24 46z" />
              <path fill="none" d="M1 1h46v46H1z" />
            </svg>
            Continue with Google
          </a>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase font-medium">
              <span className="bg-background px-3 text-muted-foreground">
                {t("auth.or")}
              </span>
            </div>
          </div>

          <div className="relative">
            {activeTab === "login" ? (
              <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-500 fill-mode-both">
                <div className="space-y-2">
                  <Label htmlFor="login-email" className="font-semibold text-foreground/90">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    className="h-11 rounded-xl bg-muted/50 border-transparent hover:bg-muted focus:bg-background focus:border-primary transition-colors"
                    placeholder="name@example.com"
                    {...loginForm.register("email")}
                    autoComplete="email"
                  />
                  {loginForm.formState.errors.email && (
                    <p className="text-sm font-medium text-destructive">
                      {loginForm.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="login-password" className="font-semibold text-foreground/90">{t("auth.password")}</Label>
                  </div>
                  <Input
                    id="login-password"
                    type="password"
                    className="h-11 rounded-xl bg-muted/50 border-transparent hover:bg-muted focus:bg-background focus:border-primary transition-colors"
                    placeholder="••••••••"
                    {...loginForm.register("password")}
                    autoComplete="current-password"
                  />
                  {loginForm.formState.errors.password && (
                    <p className="text-sm font-medium text-destructive">
                      {loginForm.formState.errors.password.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full h-11 rounded-xl font-bold shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
                  disabled={loginForm.formState.isSubmitting || loginMutation.isPending}
                >
                  {loginForm.formState.isSubmitting || loginMutation.isPending
                    ? t("auth.signingIn")
                    : t("auth.signIn")}
                </Button>
              </form>
            ) : (
              <form onSubmit={signupForm.handleSubmit(handleSignup)} className="space-y-5 animate-in fade-in slide-in-from-left-4 duration-500 fill-mode-both">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="signup-username" className="font-semibold text-foreground/90">{t("auth.username")}</Label>
                    <Input
                      id="signup-username"
                      className="h-11 rounded-xl bg-muted/50 border-transparent hover:bg-muted focus:bg-background focus:border-primary transition-colors"
                      placeholder="johndoe"
                      {...signupForm.register("username")}
                      autoComplete="username"
                    />
                    {signupForm.formState.errors.username && (
                      <p className="text-sm font-medium text-destructive">
                        {signupForm.formState.errors.username.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-fullname" className="font-semibold text-foreground/90">{t("auth.fullName")}</Label>
                    <Input
                      id="signup-fullname"
                      className="h-11 rounded-xl bg-muted/50 border-transparent hover:bg-muted focus:bg-background focus:border-primary transition-colors"
                      placeholder="John Doe"
                      {...signupForm.register("fullName")}
                    />
                    {signupForm.formState.errors.fullName && (
                      <p className="text-sm font-medium text-destructive">
                        {signupForm.formState.errors.fullName.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="font-semibold text-foreground/90">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    className="h-11 rounded-xl bg-muted/50 border-transparent hover:bg-muted focus:bg-background focus:border-primary transition-colors"
                    placeholder="name@example.com"
                    {...signupForm.register("email")}
                    autoComplete="email"
                  />
                  {signupForm.formState.errors.email && (
                    <p className="text-sm font-medium text-destructive">
                      {signupForm.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="font-semibold text-foreground/90">{t("auth.password")}</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    className="h-11 rounded-xl bg-muted/50 border-transparent hover:bg-muted focus:bg-background focus:border-primary transition-colors"
                    placeholder="••••••••"
                    {...signupForm.register("password")}
                    autoComplete="new-password"
                  />
                  {signupForm.formState.errors.password && (
                    <p className="text-sm font-medium text-destructive">
                      {signupForm.formState.errors.password.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full h-11 rounded-xl font-bold shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
                  disabled={signupForm.formState.isSubmitting || signUpMutation.isPending}
                >
                  {signupForm.formState.isSubmitting || signUpMutation.isPending
                    ? t("auth.signingUp")
                    : t("auth.signUp")}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
