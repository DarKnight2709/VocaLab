import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, fetchWithSchema, getErrorMessage } from "@/shared/lib/api";
import API_ROUTES from "@/shared/lib/api-routes";

import type { MemberRole } from "@/shared/enums/MemberRole.enum";

import {
  GetGroupsResponseSchema,
  GetGroupInfoResponseSchema,
  GetGroupMessagesResponseSchema,
  GetGroupMembersResponseSchema,
  GroupItemSchema,
  UpdateGroupResponseSchema,
  SuccessResponseSchema,
} from "@/shared/validations/GroupSchema";
import { z } from "zod";


import { toast } from "sonner";
import i18n from "@/shared/i18n";

export const groupKeys = {
  all: ["groups"] as const,
  list: () => [...groupKeys.all, "list"] as const,
  detail: (id: string) => [...groupKeys.all, id, "detail"] as const,
  info: (id: string) => [...groupKeys.detail(id), "info"] as const,
  members: (id: string) => [...groupKeys.detail(id), "members"] as const,
  messages: (id: string) => [...groupKeys.detail(id), "messages"] as const,
};

export function useGroupsQuery() {
  return useQuery({
    queryKey: groupKeys.list(),
    queryFn: async () => {
      const result = await fetchWithSchema(
        api.get(API_ROUTES.GROUP.GET_ALL),
        GetGroupsResponseSchema,
      );

      return result.data.groups ?? [];
    },
  });
}

export function useGroupInfoQuery(groupId: string | null) {
  return useQuery({
    queryKey: groupKeys.info(groupId ?? ""),
    enabled: !!groupId,
    queryFn: async () => {
      if (!groupId) return null;
      const result = await fetchWithSchema(
        api.get(API_ROUTES.GROUP.INFO(groupId)),
        GetGroupInfoResponseSchema,
      );

      return result.data.group ?? null;
    },
  });
}

export function useGroupMembersQuery(groupId: string | null) {
  return useQuery({
    queryKey: groupKeys.members(groupId ?? ""),
    enabled: !!groupId,
    queryFn: async () => {
      if (!groupId) return [];
      const result = await fetchWithSchema(
        api.get(API_ROUTES.GROUP.GET_MEMBERS(groupId)),
        GetGroupMembersResponseSchema,
      );

      return result.data.members ?? [];
    },
  });
}

export function useGroupMessagesQuery(groupId: string) {
  return useQuery({
    queryKey: groupKeys.messages(groupId ?? ""),
    queryFn: async () => {
      const result = await fetchWithSchema(
        api.get(API_ROUTES.GROUP.GET_MESSAGES(groupId)),
        GetGroupMessagesResponseSchema,
      );

      return result.data.messages ?? [];
    },
    enabled: !!groupId,
  });
}

export function useCreateGroupMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      name: string;
      description?: string;
      members: string[];
    }) => {
      return await fetchWithSchema(
        api.post(API_ROUTES.GROUP.CREATE, payload),
        GroupItemSchema,
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: groupKeys.list() });
      toast.success(i18n.t("chat.groupCreated"));
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, i18n.t("chat.groupCreateFailed")));
    },
  });
}

export function useUpdateGroupMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      groupId: string;
      payload: Record<string, unknown>;
      file?: File;
    }) => {
      const formData = new FormData();
      Object.entries(params.payload).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value as string);
        }
      });
      if (params.file) {
        formData.append("avatar", params.file);
      }
      return await fetchWithSchema(
        api.patch(API_ROUTES.GROUP.UPDATE(params.groupId), formData),
        UpdateGroupResponseSchema,
      );
    },
    onSuccess: (_, vars) => {
      void queryClient.invalidateQueries({ queryKey: groupKeys.list() });
      void queryClient.invalidateQueries({
        queryKey: groupKeys.info(vars.groupId),
      });
      toast.success(i18n.t("chat.groupUpdated"));
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, i18n.t("chat.groupUpdateFailed")));
    },
  });
}

export function useDeleteGroupMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (groupId: string) => {
      return await fetchWithSchema(
        api.delete(API_ROUTES.GROUP.DELETE(groupId)),
        SuccessResponseSchema,
      );
    },
    onSuccess: (_, groupId) => {
      queryClient.removeQueries({ queryKey: groupKeys.detail(groupId) });
      void queryClient.invalidateQueries({ queryKey: groupKeys.list() });
      toast.success(i18n.t("chat.groupDeleted"));
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, i18n.t("chat.groupDeleteFailed")));
    },
  });
}

export function useLeaveGroupMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (groupId: string) => {
      return await api.post(API_ROUTES.GROUP.LEAVE(groupId));
    },
    onSuccess: (_, groupId) => {
      queryClient.removeQueries({ queryKey: groupKeys.detail(groupId) });
      void queryClient.invalidateQueries({ queryKey: groupKeys.list() });
      toast.success(i18n.t("chat.leftGroup"));
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, i18n.t("chat.leaveGroupFailed")));
    },
  });
}

export function useTransferOwnershipMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { groupId: string; newOwnerId: string }) => {
      return await fetchWithSchema(
        api.patch(API_ROUTES.GROUP.TRANSFER_OWNERSHIP(params.groupId), {
          newOwnerId: params.newOwnerId,
        }),
        SuccessResponseSchema,
      );
    },
    onSuccess: (_, vars) => {
      void queryClient.invalidateQueries({
        queryKey: groupKeys.detail(vars.groupId),
      });
      void queryClient.invalidateQueries({ queryKey: groupKeys.list() });
      toast.success(i18n.t("chat.transferOwnershipSuccess"));
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, i18n.t("chat.transferOwnershipFailed")));
    },
  });
}

export function useAddGroupMembersMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { groupId: string; memberIds: string[] }) => {
      return await fetchWithSchema(
        api.post(API_ROUTES.GROUP.ADD_MEMBERS(params.groupId), {
          memberIds: params.memberIds,
        }),
        z.any(),
      );
    },
    onSuccess: (_, vars) => {
      void queryClient.invalidateQueries({
        queryKey: groupKeys.members(vars.groupId),
      });
      void queryClient.invalidateQueries({
        queryKey: groupKeys.info(vars.groupId),
      });
      void queryClient.invalidateQueries({ queryKey: groupKeys.list() });
      toast.success(i18n.t("chat.membersAdded"));
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, i18n.t("chat.addMembersFailed")));
    },
  });
}

export function useDeleteGroupMemberMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { groupId: string; memberId: string }) => {
      return await fetchWithSchema(
        api.delete(
          API_ROUTES.GROUP.DELETE_MEMBER(params.groupId, params.memberId),
        ),
        SuccessResponseSchema,
      );
    },
    onSuccess: (_, vars) => {
      void queryClient.invalidateQueries({
        queryKey: groupKeys.members(vars.groupId),
      });
      void queryClient.invalidateQueries({
        queryKey: groupKeys.info(vars.groupId),
      });
      void queryClient.invalidateQueries({ queryKey: groupKeys.list() });
      toast.success(i18n.t("chat.memberRemoved"));
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, i18n.t("chat.removeMemberFailed")));
    },
  });
}

export function useChangeGroupRoleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      groupId: string;
      memberId: string;
      role: MemberRole;
    }) => {
      return await fetchWithSchema(
        api.patch(
          API_ROUTES.GROUP.CHANGE_ROLE(params.groupId, params.memberId),
          { newRole: params.role },
        ),
        z.any(),
      );
    },
    onSuccess: (_, vars) => {
      void queryClient.invalidateQueries({
        queryKey: groupKeys.members(vars.groupId),
      });
      void queryClient.invalidateQueries({
        queryKey: groupKeys.info(vars.groupId),
      });
      toast.success(i18n.t("chat.roleChanged"));
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, i18n.t("chat.changeRoleFailed")));
    },
  });
}

export function useUpdateRolePermissionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      groupId: string;
      role: MemberRole;
      permissionId: string;
      isEnabled: boolean;
    }) => {
      return await api.patch(API_ROUTES.GROUP.UPDATE_ROLE_PERMISSION(params.groupId), {
        role: params.role,
        permissionId: params.permissionId,
        isEnabled: params.isEnabled,
      });
    },
    onSuccess: (_, vars) => {
      void queryClient.invalidateQueries({
        queryKey: groupKeys.info(vars.groupId),
      });
      void queryClient.invalidateQueries({
        queryKey: groupKeys.members(vars.groupId),
      });
      toast.success(i18n.t("chat.permissionsUpdated"));
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, i18n.t("chat.updatePermissionsFailed")));
    },
  });
}

export function useAvailablePermissionsQuery() {
  return useQuery({
    queryKey: ["available-permissions"],
    queryFn: async () => {
      try {
        const response = await api.get(API_ROUTES.GROUP.GET_AVAILABLE_PERMISSIONS);
        // The interceptor might have already nested this into response.data
        // We look for permissions in response.data or response.data.data
        const data = response.data as any;
        const perms = data?.permissions || data?.data?.permissions || [];
        
        return perms;
      } catch (e) {
        console.error('Failed to fetch permissions:', e);
        return [];
      }
    },
    staleTime: 1000 * 60 * 5,
  });
}

