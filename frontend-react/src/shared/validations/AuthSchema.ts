import z from "zod";
import { BaseEntityDTO } from "./CommonSchema";

export const LoginSchema = z
  .object({
    email: z.string().email("Email không hợp lệ"),
    password: z.string().trim().min(1, "Mật khẩu không được để trống"),
  })
  .strict()
  .strip();

export const SignUpSchema = z
  .object({
    username: z.string().trim().min(1, "Tên đăng nhập không được để trống"),
    fullName: z.string().trim().min(1, "Họ và tên không được để trống"),
    email: z.string().email("Email không hợp lệ"),
    password: z.string().trim().min(1, "Mật khẩu không được để trống"),
  })
  .strict()
  .strip();

export const LogoutSchema = z
  .object({
    refreshToken: z.string(),
  })
  .strict()
  .strip();

export const RefreshTokenSchema = z
  .object({
    refreshToken: z.string(),
  })
  .strict()
  .strip();

export const LoginResponseSchema = z
  .object({
    accessToken: z.string(),
    refreshToken: z.string(),
  })
  .strip();

export const TempTokenResponseSchema = z
  .object({
    tempToken: z.string(),
  })
  .strip();

export const TwoFactorLoginSchema = z
  .object({
    tempToken: z.string(),
    code: z.string().trim().length(6, "Mã OTP phải có đúng 6 ký tự"),
  })
  .strict()
  .strip();


export const RefreshTokenResponseSchema = z
  .object({
    accessToken: z.string(),
    refreshToken: z.string(),
  })
  .strip();

export const MeResponseSchema = BaseEntityDTO.extend({
  username: z.string(),
  fullName: z.string(),
  hasPassword: z.boolean().optional(),
  isTwoFactorEnabled: z.boolean().optional(),
  email: z.string().optional(),
  avatar: z.string().optional().nullable(),
});

export const ChangePasswordSchema = z
  .object({
    oldPassword: z.string().trim().min(1, "Mật khẩu cũ không được để trống"),
    newPassword: z
      .string()
      .trim()
      .min(6, "Mật khẩu mới phải có ít nhất 6 ký tự"),
  })
  // dùng để đảm bảo không có trường dư thừa
  .strict()
  .strip();
export const SetPasswordSchema = z
  .object({
    password: z.string().trim().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
  })
  // dùng để đảm bảo không có trường dư thừa
  .strict()
  .strip();

export const TwoFactorAuthResponseSchema = z.object({
  qrCode: z.string()
});

export const UploadAvatarResponseSchema = z.object({
  avatarUrl: z.string(),
});


export type LoginBodyType = z.infer<typeof LoginSchema>;
export type SignUpBodyType = z.infer<typeof SignUpSchema>;
export type LoginResponse = z.infer<typeof LoginResponseSchema>;
export type TempTokenResponse = z.infer<typeof TempTokenResponseSchema>;
export type ChangePasswordBodyType = z.infer<typeof ChangePasswordSchema>;
export type SetPasswordBodyType = z.infer<typeof SetPasswordSchema>;
export type UploadAvatarResponse = z.infer<typeof UploadAvatarResponseSchema>;
export type MeResponse = z.infer<typeof MeResponseSchema>;
export type RefreshTokenResponse = z.infer<typeof RefreshTokenResponseSchema>;
export type RefreshTokenBodyType = z.infer<typeof RefreshTokenSchema>;
export type LogoutBodyType = z.infer<typeof LogoutSchema>;
export type TwoFactorLoginBodyType = z.infer<typeof TwoFactorLoginSchema>;
