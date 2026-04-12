import { useMemo, useState } from "react";
import { Navigate, useNavigate, useLocation } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import envConfig from "@/shared/config/envConfig";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui/tabs";
import {
  useLoginMutation,
  useSignUpMutation,
} from "@/features/auth/api/authService";
import {
  LoginSchema,
  SignUpSchema,
  type LoginBodyType,
  type SignUpBodyType,
} from "@/shared/validations/AuthSchema";
import { useAppSelector } from "@/shared/stores/redux/hooks";
import ROUTES from "@/shared/lib/routes";

export default function LoginPage() {
  const isAuth = useAppSelector((s) => s.auth.isAuth);
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");

  // Lấy đường dẫn mà người dùng định truy cập trước khi bị redirect sang đây
  const from = location.state?.from || ROUTES.HOME.url;

  const loginMutation = useLoginMutation();
  const signUpMutation = useSignUpMutation();

  const loginForm = useForm<LoginBodyType>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { username: "", password: "" },
  });

  const signupForm = useForm<SignUpBodyType>({
    resolver: zodResolver(SignUpSchema),
    defaultValues: { username: "", password: "", fullName: "", email: "" },
  });

  const googleAuthUrl = useMemo(
    () => `${envConfig.VITE_API_URL}/auth/google`,
    [],
  );

  if (isAuth) {
    return <Navigate to={from} replace />;
  }

  async function handleLogin(data: LoginBodyType) {
    try {
      await loginMutation.mutateAsync({
        username: data.username,
        password: data.password,
      });
      navigate(from, { replace: true });
    } catch {
      // toast is handled inside the mutation
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
      loginForm.setValue("username", data.username);
    } catch {
      // toast is handled inside the mutation
    }
  }

  return (
    <div className="min-h-dvh flex items-center justify-center p-4 bg-muted">
      <div className="w-full max-w-md bg-card border text-card-foreground rounded-xl shadow-xl overflow-hidden">
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as "login" | "signup")}
        >
          <div className="p-6 border-b">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Đăng nhập</TabsTrigger>
              <TabsTrigger value="signup">Đăng ký</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="login" className="p-6 space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-center mb-2">Đăng nhập</h2>
              <p className="text-sm text-muted-foreground text-center">
                Chưa có tài khoản?{" "}
                <button
                  type="button"
                  className="text-primary hover:underline font-medium"
                  onClick={() => setActiveTab("signup")}
                >
                  Đăng ký
                </button>
              </p>
            </div>

            <a
              href={googleAuthUrl}
              className="flex items-center justify-center gap-3 w-full border rounded-lg px-4 py-2 hover:bg-accent transition-colors"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 48 48"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill="#EA4335"
                  d="M24 9.5c3.54 0 6.3 1.53 8.27 3.24l6.01-5.99C34.57 3.33 29.74 1 24 1 14.9 1 7.09 6.2 3.25 13.73l7.02 5.45C12.16 13.08 17.61 9.5 24 9.5z"
                />
                <path
                  fill="#4285F4"
                  d="M46.5 24.5c0-1.67-.15-2.85-.47-4.08H24v7.73h12.86c-.26 2.03-1.67 5.09-4.8 7.14l7.38 5.7C44.8 35.02 46.5 29.62 46.5 24.5z"
                />
                <path
                  fill="#FBBC05"
                  d="M10.27 28.18c-.5-1.48-.8-3.06-.8-4.68s.3-3.2.79-4.68l-7.02-5.45C1.85 16.15 1 20.17 1 23.5c0 3.33.85 7.35 2.24 10.13l7.03-5.45z"
                />
                <path
                  fill="#34A853"
                  d="M24 46c5.74 0 10.56-1.9 14.08-5.18l-7.38-5.7c-1.97 1.38-4.61 2.33-6.7 2.33-6.39 0-11.84-3.58-13.73-8.68l-7.02 5.45C7.09 41.8 14.9 46 24 46z"
                />
                <path fill="none" d="M1 1h46v46H1z" />
              </svg>
              <span className="font-semibold">Google</span>
            </a>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground">
                  hoặc
                </span>
              </div>
            </div>

            <form
              onSubmit={loginForm.handleSubmit(handleLogin)}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="login-username">Tên đăng nhập</Label>
                <Input
                  id="login-username"
                  {...loginForm.register("username")}
                  autoComplete="username"
                />
                {loginForm.formState.errors.username && (
                  <p className="text-sm text-destructive">
                    {loginForm.formState.errors.username.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="login-password">Mật khẩu</Label>
                <Input
                  id="login-password"
                  type="password"
                  {...loginForm.register("password")}
                  autoComplete="current-password"
                />
                {loginForm.formState.errors.password && (
                  <p className="text-sm text-destructive">
                    {loginForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={
                  loginForm.formState.isSubmitting || loginMutation.isPending
                }
              >
                {loginForm.formState.isSubmitting || loginMutation.isPending
                  ? "Đang đăng nhập..."
                  : "Đăng nhập"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup" className="p-6 space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-center mb-2">Đăng ký</h2>
              <p className="text-sm text-muted-foreground text-center">
                Đã có tài khoản?{" "}
                <button
                  type="button"
                  className="text-primary hover:underline font-medium"
                  onClick={() => setActiveTab("login")}
                >
                  Đăng nhập
                </button>
              </p>
            </div>

            <a
              href={googleAuthUrl}
              className="flex items-center justify-center gap-3 w-full border rounded-lg px-4 py-2 hover:bg-accent transition-colors"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 48 48"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill="#EA4335"
                  d="M24 9.5c3.54 0 6.3 1.53 8.27 3.24l6.01-5.99C34.57 3.33 29.74 1 24 1 14.9 1 7.09 6.2 3.25 13.73l7.02 5.45C12.16 13.08 17.61 9.5 24 9.5z"
                />
                <path
                  fill="#4285F4"
                  d="M46.5 24.5c0-1.67-.15-2.85-.47-4.08H24v7.73h12.86c-.26 2.03-1.67 5.09-4.8 7.14l7.38 5.7C44.8 35.02 46.5 29.62 46.5 24.5z"
                />
                <path
                  fill="#FBBC05"
                  d="M10.27 28.18c-.5-1.48-.8-3.06-.8-4.68s.3-3.2.79-4.68l-7.02-5.45C1.85 16.15 1 20.17 1 23.5c0 3.33.85 7.35 2.24 10.13l7.03-5.45z"
                />
                <path
                  fill="#34A853"
                  d="M24 46c5.74 0 10.56-1.9 14.08-5.18l-7.38-5.7c-1.97 1.38-4.61 2.33-6.7 2.33-6.39 0-11.84-3.58-13.73-8.68l-7.02 5.45C7.09 41.8 14.9 46 24 46z"
                />
                <path fill="none" d="M1 1h46v46H1z" />
              </svg>
              <span className="font-semibold">Google</span>
            </a>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground">
                  hoặc
                </span>
              </div>
            </div>

            <form
              onSubmit={signupForm.handleSubmit(handleSignup)}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="signup-username">Tên đăng nhập</Label>
                <Input
                  id="signup-username"
                  {...signupForm.register("username")}
                  autoComplete="username"
                />
                {signupForm.formState.errors.username && (
                  <p className="text-sm text-destructive">
                    {signupForm.formState.errors.username.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-fullname">Họ và tên</Label>
                <Input
                  id="signup-fullname"
                  {...signupForm.register("fullName")}
                />
                {signupForm.formState.errors.fullName && (
                  <p className="text-sm text-destructive">
                    {signupForm.formState.errors.fullName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  {...signupForm.register("email")}
                  autoComplete="email"
                />
                {signupForm.formState.errors.email && (
                  <p className="text-sm text-destructive">
                    {signupForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-password">Mật khẩu</Label>
                <Input
                  id="signup-password"
                  type="password"
                  {...signupForm.register("password")}
                  autoComplete="new-password"
                />
                {signupForm.formState.errors.password && (
                  <p className="text-sm text-destructive">
                    {signupForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={
                  signupForm.formState.isSubmitting || signUpMutation.isPending
                }
              >
                {signupForm.formState.isSubmitting || signUpMutation.isPending
                  ? "Đang đăng ký..."
                  : "Đăng ký"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
