import z from "zod";
import { BaseEntityDTO } from "./CommonSchema";

export const LoginSchema = z
  .object({
    username: z.string().trim().min(1, "Tên đăng nhập không được để trống"),
    password: z.string().trim().min(1, "Mật khẩu không được để trống"),
  })
  .strict()
  .strip();

export type LoginBodyType = z.infer<typeof LoginSchema>;

export const SignUpSchema = z
  .object({
    username: z.string().trim().min(1, "Tên đăng nhập không được để trống"),
    fullName: z.string().trim().min(1, "Họ và tên không được để trống"),
    email: z.string().email("Email không hợp lệ"),
    password: z.string().trim().min(1, "Mật khẩu không được để trống"),
  })
  .strict()
  .strip();

export type SignUpBodyType = z.infer<typeof SignUpSchema>;




// Phần này thêm sau (thêm refresh token).

// export const LogoutSchema = z
//   .object({
//     refreshToken: z.string(),
//   })
//   .strict()
//   .strip();

// export type LogoutBodyType = z.infer<typeof LogoutSchema>;

// export const RefreshTokenSchema = z
//   .object({
//     refreshToken: z.string(),
//   })
//   .strict()
//   .strip();

// export type RefreshTokenBodyType = z.infer<typeof RefreshTokenSchema>;


export const LoginResponseSchema = z
  .object({
    message: z.string(),
    token: z.string(),
    // refreshToken: z.string(),
  })
  .strip();

export type LoginResponse = z.infer<typeof LoginResponseSchema>;

export const SignUpResponseSchema = z
  .object({
    message: z.string(),
  })
  .strip();

export type SignUpResponse = z.infer<typeof SignUpResponseSchema>;

// export const RefreshTokenResponseSchema = z
//   .object({
//     accessToken: z.string(),
//     refreshToken: z.string(),
//   })
//   .strip();

// export type RefreshTokenResponse = z.infer<typeof RefreshTokenResponseSchema>;

export const MeResponseSchema = BaseEntityDTO.extend({
  username: z.string(),
  fullName: z.string(),
  email: z.string().optional(),
  avatar: z.string().optional().nullable(),
});

export type MeResponse = z.infer<typeof MeResponseSchema>;

export const UpdatePersonalInfoSchema = z
  .object({
    fullName: z.string().trim().min(1, "Họ và tên không được để trống").optional(),
    username: z.string().trim().min(1, "Tên đăng nhập không được để trống").optional(),
    email: z.string().email("Email không hợp lệ").optional().nullable(),
    avatar: z.string().optional().nullable(),
  })
  .strict()
  .strip();

export type UpdatePersonalInfoBodyType = z.infer<typeof UpdatePersonalInfoSchema>;

export const ChangePasswordSchema = z
  .object({
    oldPassword: z.string().trim().min(1, "Mật khẩu cũ không được để trống"),
    newPassword: z.string().trim().min(6, "Mật khẩu mới phải có ít nhất 6 ký tự"),
  })
  // dùng để đảm bảo không có trường dư thừa
  .strict()
  .strip();

export type ChangePasswordBodyType = z.infer<typeof ChangePasswordSchema>;

export const UpdateProfileResponseSchema = z.object({
  message: z.string(),
});

export type UpdateProfileResponse = z.infer<typeof UpdateProfileResponseSchema>;