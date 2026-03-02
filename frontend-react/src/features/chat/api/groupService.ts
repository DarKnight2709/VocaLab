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
} from "@/shared/validations/GroupSchema";
import { toast } from "sonner";

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
      const data = await fetchWithSchema(
        api.get(API_ROUTES.GROUP.GET_ALL),
        GetGroupsResponseSchema,
      );

      return data.groups ?? [];
    },
  });
}

export function useGroupInfoQuery(groupId: string | null) {
  return useQuery({
    queryKey: groupKeys.info(groupId ?? ""),
    enabled: !!groupId,
    queryFn: async () => {
      if (!groupId) return null;
      const data = await fetchWithSchema(
        api.get(API_ROUTES.GROUP.INFO(groupId)),
        GetGroupInfoResponseSchema,
      );

      return data.group ?? null;
    },
  });
}

export function useGroupMembersQuery(groupId: string | null) {
  return useQuery({
    queryKey: groupKeys.members(groupId ?? ""),
    enabled: !!groupId,
    queryFn: async () => {
      if (!groupId) return [];
      const data = await fetchWithSchema(
        api.get(API_ROUTES.GROUP.GET_MEMBERS(groupId)),
        GetGroupMembersResponseSchema,
      );

      return data.members ?? [];
    },
  });
}

export function useGroupMessagesQuery(groupId: string) {
  return useQuery({
    queryKey: groupKeys.messages(groupId ?? ""),
    queryFn: async () => {
      const data = await fetchWithSchema(
        api.get(API_ROUTES.GROUP.GET_MESSAGES(groupId)),
        GetGroupMessagesResponseSchema,
      );

      return data.messages ?? [];
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
      toast.success("Tạo nhóm thành công.");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Tạo nhóm thất bại."));
    },
  });
}

export function useUpdateGroupMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      groupId: string;
      payload: Record<string, unknown>;
    }) => {
      return await fetchWithSchema(
        api.patch(API_ROUTES.GROUP.UPDATE(params.groupId), params.payload),
        GroupItemSchema,
      );
    },
    onSuccess: (_data, vars) => {
      void queryClient.invalidateQueries({ queryKey: groupKeys.list() });
      void queryClient.invalidateQueries({
        queryKey: groupKeys.info(vars.groupId),
      });
      toast.success("Cập nhật nhóm thành công.");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Cập nhật nhóm thất bại."));
    },
  });
}

export function useDeleteGroupMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (groupId: string) => {
      return await fetchWithSchema(
        api.delete(API_ROUTES.GROUP.DELETE(groupId)),
        GroupItemSchema,
      );
    },
    onSuccess: (_data, groupId) => {
      queryClient.removeQueries({ queryKey: groupKeys.detail(groupId) });
      void queryClient.invalidateQueries({ queryKey: groupKeys.list() });
      toast.success("Xóa nhóm thành công.");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Xóa nhóm thất bại."));
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
        GetGroupMembersResponseSchema,
      );
    },
    onSuccess: (_data, vars) => {
      void queryClient.invalidateQueries({
        queryKey: groupKeys.members(vars.groupId),
      });
      void queryClient.invalidateQueries({
        queryKey: groupKeys.info(vars.groupId),
      });
      void queryClient.invalidateQueries({ queryKey: groupKeys.list() });
      toast.success("Thêm thành viên thành công.");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Thêm thành viên thất bại."));
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
        GetGroupMembersResponseSchema,
      );
    },
    onSuccess: (_data, vars) => {
      void queryClient.invalidateQueries({
        queryKey: groupKeys.members(vars.groupId),
      });
      void queryClient.invalidateQueries({
        queryKey: groupKeys.info(vars.groupId),
      });
      void queryClient.invalidateQueries({ queryKey: groupKeys.list() });
      toast.success("Xóa thành viên thành công.");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Xóa thành viên thất bại."));
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
        GetGroupMembersResponseSchema,
      );
    },
    onSuccess: (_data, vars) => {
      void queryClient.invalidateQueries({
        queryKey: groupKeys.members(vars.groupId),
      });
      void queryClient.invalidateQueries({
        queryKey: groupKeys.info(vars.groupId),
      });
      toast.success("Thay đổi vai trò thành công.");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Thay đổi vai trò thất bại."));
    },
  });
}
