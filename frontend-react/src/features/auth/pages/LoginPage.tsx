import { useMemo, useState, useEffect } from "react";
import { Navigate, useNavigate, useLocation, Link } from "react-router";
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
import API_ROUTES from "@/shared/lib/api-routes";
import { api } from "@/shared/lib/api";
import { useAuthStore } from "../stores/authStore";
import { toast } from "sonner";
import { useTranslation } from "@/shared/hooks/useTranslation";
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Loader2,
  ArrowLeft,
} from "lucide-react";

export default function LoginPage() {
  const isAuth = useAuthStore((state) => state.isAuth);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const [showPassword, setShowPassword] = useState(false);

  // Lấy đường dẫn mà người dùng định truy cập trước khi bị redirect sang đây
  const from = location.state?.from || ROUTES.HOME.url;

  // On mount, if memory state is not authenticated, verify if valid cookie exists in browser
  useEffect(() => {
    if (isAuth) return;

    let isMounted = true;
    api.get(API_ROUTES.AUTH.ME)
      .then((res: any) => {
        const me = res?.data || res;
        if (me?.id && isMounted) {
          useAuthStore.setState({ isAuth: true, userId: me.id });
          navigate(from, { replace: true });
        }
      })
      .catch(() => {
        // Guest user or no cookie — stay on login page cleanly
      });

    return () => {
      isMounted = false;
    };
  }, [isAuth, navigate, from]);

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
    () => `${envConfig.VITE_GOOGLE_AUTH_URL}`,
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
    <div className="flex min-h-screen w-full bg-background font-sans selection:bg-primary/20 selection:text-primary">
      {/* ────────── Visual / Branding Side ────────── */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-zinc-950 p-12 lg:p-14 text-zinc-300 lg:flex border-r border-zinc-800/80">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f1f_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f1f_1px,transparent_1px)] bg-[size:20px_20px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_40%,#000_70%,transparent_100%)] pointer-events-none" />
        
        {/* Soft atmospheric ambient glow */}
        <div className="absolute top-1/3 left-1/4 w-[450px] h-[450px] bg-primary/15 rounded-full blur-[130px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-10 w-[350px] h-[350px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

        {/* Top Bar with Logo and Home Link */}
        <div className="relative z-10 flex items-center justify-between">
          <Link to={ROUTES.LANDING.url} className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-zinc-950 shadow-md group-hover:scale-105 transition-all">
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>
            <span className="text-xl font-extrabold tracking-tight text-white">VocaLab</span>
          </Link>

          <Link
            to={ROUTES.LANDING.url}
            className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>
        </div>

        {/* Hero Branding Copy (Preserved original text) */}
        <div className="relative z-10 space-y-6 my-auto max-w-lg">
          <h1 className="text-4xl lg:text-5xl font-black leading-[1.18] tracking-tight text-white drop-shadow-xs">
            Discover a <br />
            New World <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-zinc-400">
              of Vocabulary.
            </span>
          </h1>
          <p className="max-w-md text-base lg:text-lg text-zinc-400 font-medium leading-relaxed">
            Join thousands of learners elevating their language skills through collaborative, community-driven study.
          </p>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-xs font-medium text-zinc-500">
          © {new Date().getFullYear()} VocaLab Inc. All rights reserved.
        </div>
      </div>

      {/* ────────── Form Side ────────── */}
      <div className="flex w-full flex-col items-center justify-center p-6 sm:p-10 lg:w-1/2 lg:p-14">
        <div className="w-full max-w-md space-y-7 animate-in fade-in duration-300">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-between pb-2">
            <Link to={ROUTES.LANDING.url} className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground font-black text-sm shadow-xs">
                V
              </div>
              <span className="text-xl font-extrabold tracking-tight text-foreground">VocaLab</span>
            </Link>
            <Link to={ROUTES.LANDING.url} className="text-xs font-semibold text-muted-foreground hover:text-foreground">
              Home
            </Link>
          </div>

          {/* Form Header */}
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              {activeTab === "login" ? t("auth.signIn") : t("auth.signUp")}
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground font-medium">
              {activeTab === "login" ? (
                <>
                  {t("auth.noAccount")}{" "}
                  <button
                    type="button"
                    className="font-bold text-primary hover:underline transition-all cursor-pointer"
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
                    className="font-bold text-primary hover:underline transition-all cursor-pointer"
                    onClick={() => setActiveTab("login")}
                  >
                    {t("auth.signIn")}
                  </button>
                </>
              )}
            </p>
          </div>

          {/* Continue with Google */}
          <a
            href={googleAuthUrl}
            className="flex w-full items-center justify-center gap-3 rounded-2xl border border-border/80 bg-card px-4 py-2.5 text-xs sm:text-sm font-bold text-foreground shadow-xs transition-all hover:bg-muted/70 hover:border-primary/40 active:scale-[0.99] cursor-pointer"
          >
            <svg width="18" height="18" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.3 1.53 8.27 3.24l6.01-5.99C34.57 3.33 29.74 1 24 1 14.9 1 7.09 6.2 3.25 13.73l7.02 5.45C12.16 13.08 17.61 9.5 24 9.5z" />
              <path fill="#4285F4" d="M46.5 24.5c0-1.67-.15-2.85-.47-4.08H24v7.73h12.86c-.26 2.03-1.67 5.09-4.8 7.14l7.38 5.7C44.8 35.02 46.5 29.62 46.5 24.5z" />
              <path fill="#FBBC05" d="M10.27 28.18c-.5-1.48-.8-3.06-.8-4.68s.3-3.2.79-4.68l-7.02-5.45C1.85 16.15 1 20.17 1 23.5c0 3.33.85 7.35 2.24 10.13l7.03-5.45z" />
              <path fill="#34A853" d="M24 46c5.74 0 10.56-1.9 14.08-5.18l-7.38-5.7c-1.97 1.38-4.61 2.33-6.7 2.33-6.39 0-11.84-3.58-13.73-8.68l-7.02 5.45C7.09 41.8 14.9 46 24 46z" />
              <path fill="none" d="M1 1h46v46H1z" />
            </svg>
            <span>Continue with Google</span>
          </a>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border/80" />
            </div>
            <div className="relative flex justify-center text-[11px] uppercase font-extrabold">
              <span className="bg-background px-3 text-muted-foreground">
                {t("auth.or")}
              </span>
            </div>
          </div>

          {/* Forms */}
          <div className="relative">
            {activeTab === "login" ? (
              <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4 animate-in fade-in duration-300">
                <div className="space-y-1.5">
                  <Label htmlFor="login-email" className="text-xs font-bold text-foreground">Email</Label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="login-email"
                      type="email"
                      className="h-10 rounded-2xl pl-10 pr-4 text-xs font-medium bg-card border-border/80 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 shadow-xs"
                      placeholder="name@example.com"
                      {...loginForm.register("email")}
                      autoComplete="email"
                    />
                  </div>
                  {loginForm.formState.errors.email && (
                    <p className="text-xs font-semibold text-destructive mt-1">
                      {loginForm.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="login-password" className="text-xs font-bold text-foreground">{t("auth.password")}</Label>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      className="h-10 rounded-2xl pl-10 pr-10 text-xs font-medium bg-card border-border/80 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 shadow-xs"
                      placeholder="••••••••"
                      {...loginForm.register("password")}
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer p-0.5"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {loginForm.formState.errors.password && (
                    <p className="text-xs font-semibold text-destructive mt-1">
                      {loginForm.formState.errors.password.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full h-11 rounded-2xl font-extrabold text-xs shadow-md shadow-primary/20 hover:shadow-lg transition-all active:scale-[0.99] cursor-pointer mt-2"
                  disabled={loginForm.formState.isSubmitting || loginMutation.isPending}
                >
                  {loginForm.formState.isSubmitting || loginMutation.isPending ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {t("auth.signingIn")}
                    </span>
                  ) : (
                    t("auth.signIn")
                  )}
                </Button>
              </form>
            ) : (
              <form onSubmit={signupForm.handleSubmit(handleSignup)} className="space-y-4 animate-in fade-in duration-300">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1.5">
                    <Label htmlFor="signup-username" className="text-xs font-bold text-foreground">{t("auth.username")}</Label>
                    <div className="relative">
                      <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="signup-username"
                        className="h-10 rounded-2xl pl-10 pr-3 text-xs font-medium bg-card border-border/80 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 shadow-xs"
                        placeholder="johndoe"
                        {...signupForm.register("username")}
                        autoComplete="username"
                      />
                    </div>
                    {signupForm.formState.errors.username && (
                      <p className="text-xs font-semibold text-destructive mt-1">
                        {signupForm.formState.errors.username.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="signup-fullname" className="text-xs font-bold text-foreground">{t("auth.fullName")}</Label>
                    <Input
                      id="signup-fullname"
                      className="h-10 rounded-2xl px-3.5 text-xs font-medium bg-card border-border/80 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 shadow-xs"
                      placeholder="John Doe"
                      {...signupForm.register("fullName")}
                    />
                    {signupForm.formState.errors.fullName && (
                      <p className="text-xs font-semibold text-destructive mt-1">
                        {signupForm.formState.errors.fullName.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="signup-email" className="text-xs font-bold text-foreground">Email</Label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="signup-email"
                      type="email"
                      className="h-10 rounded-2xl pl-10 pr-4 text-xs font-medium bg-card border-border/80 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 shadow-xs"
                      placeholder="name@example.com"
                      {...signupForm.register("email")}
                      autoComplete="email"
                    />
                  </div>
                  {signupForm.formState.errors.email && (
                    <p className="text-xs font-semibold text-destructive mt-1">
                      {signupForm.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="signup-password" className="text-xs font-bold text-foreground">{t("auth.password")}</Label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="signup-password"
                      type={showPassword ? "text" : "password"}
                      className="h-10 rounded-2xl pl-10 pr-10 text-xs font-medium bg-card border-border/80 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 shadow-xs"
                      placeholder="••••••••"
                      {...signupForm.register("password")}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer p-0.5"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {signupForm.formState.errors.password && (
                    <p className="text-xs font-semibold text-destructive mt-1">
                      {signupForm.formState.errors.password.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full h-11 rounded-2xl font-extrabold text-xs shadow-md shadow-primary/20 hover:shadow-lg transition-all active:scale-[0.99] cursor-pointer mt-2"
                  disabled={signupForm.formState.isSubmitting || signUpMutation.isPending}
                >
                  {signupForm.formState.isSubmitting || signUpMutation.isPending ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {t("auth.signingUp")}
                    </span>
                  ) : (
                    t("auth.signUp")
                  )}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
