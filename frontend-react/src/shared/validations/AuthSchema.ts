import { z } from "zod";
import { BaseEntityDTO } from "./CommonSchema";
import { UserSocialItemSchema } from "./UserSchema";
import i18n from "@/shared/i18n";
import { ScopeVisibility } from "../enums/ScopeVisibility.enum";

export const getLoginSchema = () =>
  z
    .object({
      email: z.string().email(i18n.t("validation.invalidEmail")),
      password: z.string().trim().min(1, i18n.t("validation.passwordRequired")),
    })
    .strict()
    .strip();

export const getSignUpSchema = () =>
  z
    .object({
      username: z.string().trim().min(1, i18n.t("validation.usernameRequired")),
      fullName: z.string().trim().min(1, i18n.t("validation.fullNameRequired")),
      email: z.string().email(i18n.t("validation.invalidEmail")),
      password: z.string().trim().min(1, i18n.t("validation.passwordRequired")),
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

export const getTwoFactorLoginSchema = () =>
  z
    .object({
      tempToken: z.string(),
      code: z.string().trim().length(6, i18n.t("validation.otpLength")),
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
  privacySettings: z
    .object({
      allowFollow: z.boolean().optional(),
      messageScope: z.nativeEnum(ScopeVisibility).optional(),
      followersTabVisibility: z.nativeEnum(ScopeVisibility).optional(),
      followingTabVisibility: z.nativeEnum(ScopeVisibility).optional(),
      friendTabVisibility: z.nativeEnum(ScopeVisibility).optional(),
      groupsTabVisibility: z.nativeEnum(ScopeVisibility).optional(),
    })
    .optional(),
  email: z.string().optional(),
  avatar: z.string().optional().nullable(),
  socials: z.array(z.lazy(() => UserSocialItemSchema)).optional(),
});

export const getChangePasswordSchema = () =>
  z
    .object({
      oldPassword: z
        .string()
        .trim()
        .min(1, i18n.t("validation.currentPasswordRequired")),
      newPassword: z.string().trim().min(6, i18n.t("validation.passwordMin")),
    })
    // Keep the payload strict so no extra fields slip through.
    .strict()
    .strip();
export const getSetPasswordSchema = () =>
  z
    .object({
      password: z.string().trim().min(6, i18n.t("validation.passwordMin")),
    })
    // Keep the payload strict so no extra fields slip through.
    .strict()
    .strip();

export const TwoFactorAuthResponseSchema = z.object({
  qrCode: z.string(),
});

export const UploadAvatarResponseSchema = z.object({
  avatarUrl: z.string(),
});

export type LoginBodyType = z.infer<ReturnType<typeof getLoginSchema>>;
export type SignUpBodyType = z.infer<ReturnType<typeof getSignUpSchema>>;
export type LoginResponse = z.infer<typeof LoginResponseSchema>;
export type TempTokenResponse = z.infer<typeof TempTokenResponseSchema>;
export type ChangePasswordBodyType = z.infer<
  ReturnType<typeof getChangePasswordSchema>
>;
export type SetPasswordBodyType = z.infer<
  ReturnType<typeof getSetPasswordSchema>
>;
export type UploadAvatarResponse = z.infer<typeof UploadAvatarResponseSchema>;
export type MeResponse = z.infer<typeof MeResponseSchema>;
export type RefreshTokenResponse = z.infer<typeof RefreshTokenResponseSchema>;
export type RefreshTokenBodyType = z.infer<typeof RefreshTokenSchema>;
export type LogoutBodyType = z.infer<typeof LogoutSchema>;
export type TwoFactorLoginBodyType = z.infer<
  ReturnType<typeof getTwoFactorLoginSchema>
>;
