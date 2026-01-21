
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/shared/lib/api";
import API_ROUTES from "@/shared/lib/api-routes";

import type {
  GroupItem,
  GetGroupsResponse,
  GetGroupInfoResponse,
} from "@/shared/validations/GroupSchema";

import type {
  GetGroupMessagesResponse,
  GetGroupMembersResponse,
} from "@/shared/validations/GroupSchema";

export function useGroupInfoQuery(groupId: string | null) {
  return useQuery({
    queryKey: ["groupInfo", groupId],
    enabled: !!groupId,
    queryFn: async () => {
      if (!groupId) return null;
      const res = await api.get<GetGroupInfoResponse>(API_ROUTES.GROUP.INFO(groupId));
      return res.data?.group ?? null;
    },
  });
}


export function useGroupMembersQuery(groupId: string | null) {
  return useQuery({
    queryKey: ["groupMembers", groupId],
    enabled: !!groupId,
    queryFn: async () => {
      if (!groupId) return [];
      const res = await api.get<GetGroupMembersResponse>(API_ROUTES.GROUP.GET_MEMBERS(groupId));
      return res.data?.members || [];
    },
  });
}


export function useGroupMessagesQuery(groupId: string) {
  return useQuery({
    queryKey: ['groupMessages', groupId],
    queryFn: async () => {
      if (!groupId) return [];
      const res = await api.get<GetGroupMessagesResponse>(API_ROUTES.GROUP.GET_MESSAGES(groupId));
      return res.data?.messages || [];
    },
    enabled: !!groupId,
  });
}


export function useCreateGroupMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { name: string; description?: string; members: string[] }) => {
      const res = await api.post<GroupItem>(API_ROUTES.GROUP.CREATE, payload);
      return res.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["groups"] });
    },
  });
}

export function useUpdateGroupMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { groupId: string; payload: Record<string, unknown> }) => {
      const res = await api.patch<GroupItem>(API_ROUTES.GROUP.UPDATE(params.groupId), params.payload);
      return res.data;
    },
    onSuccess: (_data, vars) => {
      void queryClient.invalidateQueries({ queryKey: ["groups"] });
      void queryClient.invalidateQueries({ queryKey: ["groupInfo", vars.groupId] });
    },
  });
}

export function useDeleteGroupMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (groupId: string) => {
      const res = await api.delete<GroupItem>(API_ROUTES.GROUP.DELETE(groupId));
      return res.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["groups"] });
    },
  });
}

export function useAddGroupMembersMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { groupId: string; memberIds: string[] }) => {
      const res = await api.post<GetGroupMembersResponse>(API_ROUTES.GROUP.ADD_MEMBERS(params.groupId), { memberIds: params.memberIds });
      return res.data;
    },
    onSuccess: (_data, vars) => {
      void queryClient.invalidateQueries({ queryKey: ["groupMembers", vars.groupId] });
      void queryClient.invalidateQueries({ queryKey: ["groupInfo", vars.groupId] });
      void queryClient.invalidateQueries({ queryKey: ["groups"] });
    },
  });
}

export function useDeleteGroupMemberMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { groupId: string; memberId: string }) => {
      const res = await api.delete<GetGroupMembersResponse>(API_ROUTES.GROUP.DELETE_MEMBER(params.groupId, params.memberId));
      return res.data;
    },
    onSuccess: (_data, vars) => {
      void queryClient.invalidateQueries({ queryKey: ["groupMembers", vars.groupId] });
      void queryClient.invalidateQueries({ queryKey: ["groupInfo", vars.groupId] });
      void queryClient.invalidateQueries({ queryKey: ["groups"] });
    },
  });
}

export function useChangeGroupRoleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { groupId: string; memberId: string; role: "admin" | "member" }) => {
      const res = await api.patch<GetGroupMembersResponse>(API_ROUTES.GROUP.CHANGE_ROLE(params.groupId, params.memberId), { newRole: params.role });
      return res.data;
    },
    onSuccess: (_data, vars) => {
      void queryClient.invalidateQueries({ queryKey: ["groupMembers", vars.groupId] });
      void queryClient.invalidateQueries({ queryKey: ["groupInfo", vars.groupId] });
    },
  });
}


export function useGroupsQuery() {
  return useQuery({
    queryKey: ['groups'],
    queryFn: async () => {
      const res = await api.get<GetGroupsResponse>(API_ROUTES.GROUP.GET_ALL);
      return res.data?.groups || [];
    },
  });
}
