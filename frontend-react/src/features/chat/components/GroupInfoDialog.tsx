import { useEffect, useMemo, useState } from 'react'
import { MemberRole } from '@/shared/enums/MemberRole.enum'
import { useSearchUsersQuery } from '@/features/chat/api/chatService'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar'
import { Button } from '@/shared/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog'
import { Input } from '@/shared/components/ui/input'
import { ConfirmModal } from '@/shared/components/ConfirmModal'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu"
import { 
  Crown, 
  ShieldCheck, 
  User, 
  Pencil, 
  Trash2, 
  LogOut, 
  UserPlus, 
  X,
  ChevronDown
} from 'lucide-react'
import { GroupEditDialog } from '@/features/chat/components/GroupEditDialog'
import { toast } from 'sonner'
import { useGroupMembersQuery } from '@/features/chat/api/groupService'
import {
  useGroupInfoQuery,
  useAddGroupMembersMutation,
  useChangeGroupRoleMutation,
  useDeleteGroupMemberMutation,
  useDeleteGroupMutation,
  useLeaveGroupMutation,
  useUpdateRolePermissionMutation,
  useAvailablePermissionsQuery,
  useTransferOwnershipMutation,
} from '@/features/chat/api/groupService'
import PERMISSION_GROUP from '@/shared/constants/permissions.constant'
import { useTranslation } from "@/shared/hooks/useTranslation"
import type { UserItem } from '@/shared/validations/ChatSchema'
import type { GroupInfo, GroupMember } from '@/shared/validations/GroupSchema'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  groupId: string | null
  myId: string
  onAddedMembers?: () => void
  onLeftGroup?: () => void
  onUpdatedGroup?: (group: { id: string; name?: string; description?: string; avatar?: string }) => void
}

function initials(name?: string) {
  const n = (name || '').trim()
  if (!n) return '?'
  return n
    .split(' ')
    .filter(Boolean)
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export function GroupInfoDialog({
  open,
  onOpenChange,
  groupId,
  myId,
  onAddedMembers,
  onLeftGroup,
  onUpdatedGroup,
}: Props) {
  const { t } = useTranslation()
  const [group, setGroup] = useState<GroupInfo | null>(null)
  const [members, setMembers] = useState<GroupMember[]>([])

  const [editOpen, setEditOpen] = useState(false)

  const [keyword, setKeyword] = useState('')
  const [searching, setSearching] = useState(false)
  const [results, setResults] = useState<UserItem[]>([])
  const [selectedToAdd, setSelectedToAdd] = useState<UserItem[]>([])
  const [confirmConfig, setConfirmConfig] = useState<{
    open: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
    isLoading: boolean;
    variant?: "default" | "destructive";
  }>({
    open: false,
    title: "",
    description: "",
    onConfirm: () => {},
    isLoading: false,
  });

  const memberIds = useMemo(() => new Set(members.map((m) => m.user?.id).filter(Boolean)), [members])
  const selectedIds = useMemo(() => new Set(selectedToAdd.map((u) => u.id)), [selectedToAdd])
  const infoQuery = useGroupInfoQuery(open && groupId ? groupId : null)
  const membersQuery = useGroupMembersQuery(open && groupId ? groupId : null)
  const addMembersMutation = useAddGroupMembersMutation()
  const deleteGroupMutation = useDeleteGroupMutation()
  const leaveGroupMutation = useLeaveGroupMutation()
  const deleteMemberMutation = useDeleteGroupMemberMutation()
  const changeRoleMutation = useChangeGroupRoleMutation()
  const updateRolePermissionMutation = useUpdateRolePermissionMutation()
  const availablePermissionsQuery = useAvailablePermissionsQuery()
  const transferOwnershipMutation = useTransferOwnershipMutation()

  const sortedMembers = useMemo(() => {
    return [...members].sort((a, b) => {
      const roleOrder = {
        [MemberRole.OWNER]: 0,
        [MemberRole.CO_OWNER]: 1,
        [MemberRole.MEMBER]: 2,
      };
      
      const orderA = roleOrder[a.role as MemberRole] ?? 3;
      const orderB = roleOrder[b.role as MemberRole] ?? 3;
      
      if (orderA !== orderB) return orderA - orderB;
      
      // Secondary sort: Alphabetical by name
      const nameA = (a.user?.fullName || a.user?.username || "").toLowerCase();
      const nameB = (b.user?.fullName || b.user?.username || "").toLowerCase();
      return nameA.localeCompare(nameB);
    });
  }, [members]);

  const availablePermissions = availablePermissionsQuery.data || []

  const loading = infoQuery.isLoading || membersQuery.isLoading

  useEffect(() => {
    if (!open) return
    setKeyword('')
    setResults([])
    setSelectedToAdd([])
  }, [open])

  useEffect(() => {
    if (!open || !groupId) return
    const g = (infoQuery.data as any) as GroupInfo | null | undefined
    const ms = (membersQuery.data as any) as GroupMember[] | undefined
    setGroup(g || null)
    setMembers(ms || [])
  }, [open, groupId, infoQuery.data, membersQuery.data])

  // Move Hook to top level (React Rule)
  // Logic: Only runs when open is true and keyword is not empty
  const searchQuery = useSearchUsersQuery(keyword.trim());
  
  useEffect(() => {
    if (!open) return;
    setSearching(searchQuery.isLoading);
    setResults(searchQuery.data || []);
  }, [searchQuery.data, searchQuery.isLoading, open]);

  function addPick(u: UserItem) {
    if (memberIds.has(u.id)) return
    if (selectedIds.has(u.id)) return
    setSelectedToAdd((prev) => [...prev, u])
  }

  function removePick(userId: string) {
    setSelectedToAdd((prev) => prev.filter((u) => u.id !== userId))
  }

  async function handleAddMembers() {
    if (!groupId) return
    if (selectedToAdd.length === 0) {
      toast.error(t('chat.selectMembersToAdd'))
      return
    }

    const ids = selectedToAdd.map((u) => u.id)

    try {
      await addMembersMutation.mutateAsync({ groupId, memberIds: ids })
      setSelectedToAdd([])
      setKeyword('')
      setResults([])
      onAddedMembers?.()
    } catch (e: any) {
      // toast is already handled by useAddGroupMembersMutation
    }
  }

  async function handleDeleteGroup() {
    if (!groupId) return;
    setConfirmConfig({
      open: true,
      title: t('chat.deleteGroupConfirmTitle'),
      description: t('chat.deleteGroupConfirmDesc'),
      isLoading: false,
      variant: "destructive",
      onConfirm: async () => {
        try {
          setConfirmConfig(prev => ({ ...prev, isLoading: true }))
          await deleteGroupMutation.mutateAsync(groupId)
          setConfirmConfig(prev => ({ ...prev, open: false }))
          onOpenChange(false)
          onLeftGroup?.()
        } catch (e: any) {
          setConfirmConfig(prev => ({ ...prev, isLoading: false, open: false }))
        }
      }
    })
  }

  async function handleLeaveGroup() {
    if (!groupId) return
    setConfirmConfig({
      open: true,
      title: t('chat.leaveGroupConfirmTitle'),
      description: t('chat.leaveGroupConfirmDesc'),
      isLoading: false,
      variant: "destructive",
      onConfirm: async () => {
        try {
          setConfirmConfig(prev => ({ ...prev, isLoading: true }))
          await leaveGroupMutation.mutateAsync(groupId)
          setConfirmConfig(prev => ({ ...prev, open: false }))
          onOpenChange(false)
          onLeftGroup?.()
        } catch (e: any) {
          setConfirmConfig(prev => ({ ...prev, isLoading: false, open: false }))
        }
      }
    })
  }

  async function handleTransferOwnership(targetUserId: string, targetUserName: string) {
    if (!groupId) return
    setConfirmConfig({
      open: true,
      title: t('chat.transferOwnershipConfirmTitle'),
      description: t('chat.transferOwnershipConfirmDesc', { name: targetUserName }),
      isLoading: false,
      variant: "destructive",
      onConfirm: async () => {
        try {
          setConfirmConfig(prev => ({ ...prev, isLoading: true }))
          await transferOwnershipMutation.mutateAsync({ groupId, newOwnerId: targetUserId })
          setConfirmConfig(prev => ({ ...prev, open: false }))
        } catch (e: any) {
          setConfirmConfig(prev => ({ ...prev, isLoading: false, open: false }))
        }
      }
    })
  }

  async function handleKick(memberId: string) {
    if (!groupId) return

    const target = members.find((m) => m.user?.id === memberId)
    const memberName = target?.user?.fullName || target?.user?.username || t('chat.user')

    setConfirmConfig({
      open: true,
      title: t('chat.removeMember'),
      description: t('chat.removeMemberConfirmDesc', { name: memberName }),
      isLoading: false,
      variant: "destructive",
      onConfirm: async () => {
        try {
          setConfirmConfig(prev => ({ ...prev, isLoading: true }))
          await deleteMemberMutation.mutateAsync({ groupId, memberId })
          setConfirmConfig(prev => ({ ...prev, open: false }))
        } catch (e: any) {
          setConfirmConfig(prev => ({ ...prev, isLoading: false, open: false }))
        }
      }
    })
  }

  async function handleChangeRole(memberId: string, nextRole: MemberRole) {
    if (!groupId) return

    const target = members.find((m) => m.user?.id === memberId)
    const memberName = target?.user?.fullName || target?.user?.username || t('chat.user')
    const roleName = nextRole === MemberRole.CO_OWNER ? t('chat.roleCoOwner') : t('chat.roleMember')

    setConfirmConfig({
      open: true,
      title: t('chat.changeRole'),
      description: t('chat.changeRoleConfirmDesc', { name: memberName, role: roleName }),
      isLoading: false,
      onConfirm: async () => {
        try {
          setConfirmConfig(prev => ({ ...prev, isLoading: true }))
          await changeRoleMutation.mutateAsync({ groupId, memberId, role: nextRole })
          setConfirmConfig(prev => ({ ...prev, open: false }))
        } catch (e: any) {
          setConfirmConfig(prev => ({ ...prev, isLoading: false, open: false }))
        }
      }
    })
  }
  async function handleUpdateRolePermission(role: MemberRole, permissionId: string, isEnabled: boolean) {
    if (!groupId) return
    try {
      await updateRolePermissionMutation.mutateAsync({ groupId, role, permissionId, isEnabled })
      void infoQuery.refetch()
    } catch (e: any) {
      // toast is already handled
    }
  }

  const groupRolePermissionsMap = useMemo(() => {
    const map: Record<string, { id: string }[]> = {}
    const rps = group?.rolePermissions || []
    rps.forEach((rp: any) => {
      const r = rp.role
      const pId = rp.permissionId || rp.permission?.id
      const isEnabled = rp.isEnabled !== false // Default to true if not specified, or explicitly check

      if (!map[r]) map[r] = []
      
      // Only add to map if we have an ID and it is enabled
      if (pId && isEnabled) {
        map[r].push({ id: pId })
      }
    })
    return map
  }, [group])

  const ROLE_PERMISSION_CONFIG = useMemo(() => {
    const getPermId = (name: string) => availablePermissions.find((p: any) => p.name === name)?.id

    return [
      {
        role: MemberRole.CO_OWNER,
        label: t('chat.roleCoOwner'),
        perms: [
          { key: PERMISSION_GROUP.ADD_MEMBER, label: t('chat.permAddMember'), id: getPermId(PERMISSION_GROUP.ADD_MEMBER) },
          { key: PERMISSION_GROUP.REMOVE_MEMBER, label: t('chat.permRemoveMember'), id: getPermId(PERMISSION_GROUP.REMOVE_MEMBER) },
          { key: PERMISSION_GROUP.UPDATE_GROUP_INFO, label: t('chat.permUpdateGroupInfo'), id: getPermId(PERMISSION_GROUP.UPDATE_GROUP_INFO) },
          { key: PERMISSION_GROUP.MANAGE_PERMISSIONS, label: t('chat.permManagePermissions'), id: getPermId(PERMISSION_GROUP.MANAGE_PERMISSIONS) },
        ],
      },
      {
        role: MemberRole.MEMBER,
        label: t('chat.roleMember'),
        perms: [
          { key: PERMISSION_GROUP.ADD_MEMBER, label: t('chat.permAddMember'), id: getPermId(PERMISSION_GROUP.ADD_MEMBER) },
          { key: PERMISSION_GROUP.UPDATE_GROUP_INFO, label: t('chat.permUpdateGroupInfo'), id: getPermId(PERMISSION_GROUP.UPDATE_GROUP_INFO) },
        ],
      },
    ]
  }, [availablePermissions, t])

  const groupName = group?.name || t('chat.group')
  const groupDesc = group?.description?.trim() ? group?.description : t('chat.noDescription')
  const ownerId = group?.owner?.id

  const isOwner = !!ownerId && ownerId === myId

  const myMemberInfo = useMemo(() => members.find(m => m.user?.id === myId), [members, myId])
  const myPermissions = (myMemberInfo as any)?.permissions || []

  const canEditGroup = isOwner || myPermissions.includes(PERMISSION_GROUP.UPDATE_GROUP_INFO)
  const canAddMembers = isOwner || myPermissions.includes(PERMISSION_GROUP.ADD_MEMBER)
  const canKickMembers = isOwner || myPermissions.includes(PERMISSION_GROUP.REMOVE_MEMBER)
  const canChangeRole = isOwner
  const canManagePermissions = isOwner || myPermissions.includes(PERMISSION_GROUP.MANAGE_PERMISSIONS)

  const configToShow = useMemo(() => {
    if (isOwner) return ROLE_PERMISSION_CONFIG
    return ROLE_PERMISSION_CONFIG.filter(c => c.role === MemberRole.MEMBER)
  }, [isOwner, ROLE_PERMISSION_CONFIG])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('chat.groupInfo')}</DialogTitle>
        </DialogHeader>

        <GroupEditDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          groupId={groupId}
          initial={group ? { id: group.id, name: group.name, description: group.description, avatar: group.avatar } : null}
          onUpdated={(g: any) => {
            setGroup((prev) => (prev ? { ...prev, ...g } : (g as any)))
            onUpdatedGroup?.(g as any)
          }}
        />

        {loading ? (
          <div className="text-sm text-muted-foreground">{t('chat.loading')}</div>
        ) : !groupId ? (
          <div className="text-sm text-muted-foreground">{t('chat.noGroupsFound')}</div>
        ) : (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={group?.avatar ?? undefined} />
                <AvatarFallback>{initials(groupName)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <div className="font-semibold truncate">{groupName}</div>
                <div className="text-sm text-muted-foreground truncate">{groupDesc}</div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="font-medium">{t('chat.actions')}</div>
              <div className="flex gap-2">
                {canEditGroup && (
                  <Button type="button" variant="outline" size="sm" onClick={() => setEditOpen(true)} className="h-9 hover:bg-primary/5 transition-colors">
                    <Pencil className="mr-2 h-4 w-4 text-primary" />
                    {t('vocabulary.edit')}
                  </Button>
                )}
                
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={handleLeaveGroup}
                  className="h-9 text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20 hover:border-destructive/30 transition-all font-medium"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  {t('chat.leaveGroup')}
                </Button>

                {isOwner && (
                  <Button 
                    type="button" 
                    variant="destructive" 
                    size="sm" 
                    onClick={handleDeleteGroup} 
                    className="h-9"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {t('chat.deleteGroup')}
                  </Button>
                )}
              </div>
            </div>

            {canManagePermissions && (
              <div className="space-y-3 pt-3 border-t">
                <div className="font-medium flex items-center gap-2 text-primary">
                  <ShieldCheck className="h-4 w-4" />
                  {t('chat.permissions')}
                </div>
                
                {availablePermissionsQuery.isLoading ? (
                   <div className="text-xs text-muted-foreground animate-pulse p-4 text-center bg-muted/50 rounded-lg">
                     {t('chat.loadingPermissions')}
                   </div>
                ) : availablePermissions.length === 0 ? (
                  <div className="text-xs text-destructive p-4 text-center bg-destructive/5 rounded-lg border border-destructive/10">
                    {t('chat.unableToLoadPermissions')}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-3 bg-muted/30 rounded-lg">
                    {configToShow.map((config) => (
                      <div key={config.role} className="space-y-2">
                        <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                          {config.label}
                        </div>
                        <div className="space-y-1">
                          {config.perms.map((p) => {
                            const enabled = groupRolePermissionsMap[config.role]?.some(rp => rp.id === p.id)
                            const isUpdating = updateRolePermissionMutation.isPending && 
                                             updateRolePermissionMutation.variables?.permissionId === p.id &&
                                             updateRolePermissionMutation.variables?.role === config.role

                            return (
                              <label 
                                key={p.key} 
                                className={`flex items-center justify-between text-sm p-1.5 rounded-md hover:bg-muted/50 cursor-pointer transition-colors ${!p.id ? 'opacity-50 cursor-not-allowed hidden' : ''}`}
                              >
                                <span className="flex-1">{p.label}</span>
                                <div className="flex items-center ml-2">
                                  {isUpdating ? (
                                    <div className="h-3.5 w-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                  ) : (
                                    <input 
                                      type="checkbox"
                                      checked={!!enabled}
                                      disabled={isUpdating}
                                      onChange={(e) => p.id && handleUpdateRolePermission(config.role as MemberRole, p.id, e.target.checked)}
                                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                                    />
                                  )}
                                </div>
                              </label>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {canAddMembers && (
              <div className="space-y-2">
                <div className="font-medium flex items-center gap-2">
                  <UserPlus className="h-4 w-4 text-primary" />
                    {t('chat.addMembers')}
                </div>
                {selectedToAdd.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedToAdd.map((u) => (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => removePick(u.id)}
                        className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm hover:bg-muted"
                        title={t('chat.clickToRemove')}
                      >
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs overflow-hidden">
                          {u.avatar ? (
                            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                            // @ts-ignore
                            <img src={u.avatar} className="h-6 w-6 rounded-full object-cover" />
                          ) : (
                            initials(u.fullName || u.username)
                          )}
                        </span>
                        <span className="max-w-45 truncate">{u.fullName || u.username}</span>
                        <X className="h-3 w-3 text-muted-foreground group-hover:text-destructive transition-colors" />
                      </button>
                    ))}
                  </div>
                )}

                <div className="relative">
                  <div className="flex gap-2">
                    <Input 
                      value={keyword} 
                      onChange={(e) => setKeyword(e.target.value)} 
                      placeholder={t('chat.searchByNameOrUsername')} 
                      className="h-9"
                    />
                    <Button type="button" onClick={handleAddMembers} disabled={selectedToAdd.length === 0} size="sm">
                      {t('chat.add')}
                    </Button>
                  </div>

                  {(searching || keyword.trim() !== '') && (
                    <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-lg border bg-popover p-2 shadow-xl max-h-56 overflow-auto">
                      {searching ? (
                        <div className="text-sm text-muted-foreground p-2">{t('chat.searching')}</div>
                      ) : results.length === 0 ? (
                        <div className="text-sm text-muted-foreground p-2">{t('chat.noUsersFound')}</div>
                      ) : (
                        <div className="space-y-1">
                          {results.map((u) => {
                            const disabled = memberIds.has(u.id) || selectedIds.has(u.id)
                            return (
                              <div key={u.id} className="flex items-center justify-between gap-3 rounded-md px-2 py-1.5 hover:bg-muted transition-colors">
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center overflow-hidden shrink-0">
                                    {u.avatar ? (
                                      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                                      // @ts-ignore
                                      <img src={u.avatar} className="h-8 w-8 object-cover" />
                                    ) : (
                                      <span className="text-[10px] font-semibold">{initials(u.fullName || u.username)}</span>
                                    )}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div className="font-medium text-sm truncate">{u.fullName || u.username}</div>
                                    <div className="text-[10px] text-muted-foreground truncate">
                                      @{u.username || ''}
                                    </div>
                                  </div>
                                </div>
                                <Button size="sm" variant={disabled ? 'secondary' : 'default'} disabled={disabled} onClick={() => addPick(u)} className="h-7 px-3 text-xs">
                                  {disabled ? t('chat.added') : t('chat.add')}
                                </Button>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <div className="font-medium">{t('chat.members')} ({members.length})</div>
              <div className="rounded-lg border divide-y">
                {sortedMembers.length === 0 ? (
                  <div className="p-3 text-sm text-muted-foreground">{t('chat.noUsersYet')}</div>
                ) : (
                  sortedMembers.map((m) => {
                    const u = m.user
                    const name = u?.fullName || u?.username || t('chat.user')
                    const isAdmin = m.role === MemberRole.CO_OWNER
                    const isMemberOwner = m.role === MemberRole.OWNER
                    const canKick =
                      canKickMembers &&
                      u?.id !== myId &&
                      !isMemberOwner

                    const canRoleChange = canChangeRole && u?.id !== myId && !isMemberOwner

                    return (
                      <div key={u?.id || Math.random()} className="flex items-center justify-between p-3 gap-3">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={u.avatar ?? undefined} />
                            <AvatarFallback>{initials(name)}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <div className="font-medium truncate flex items-center gap-1.5">
                              {name} 
                              {isMemberOwner && <Crown className="h-3.5 w-3.5 text-amber-500 fill-amber-500/10" />}
                            </div>
                            <div className="text-xs text-muted-foreground truncate">@{u?.username || ''}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {canRoleChange ? (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-8 gap-1 px-2 text-xs font-medium hover:bg-muted"
                                  disabled={u.id === myId}
                                >
                                  {m.role === MemberRole.CO_OWNER ? (
                                    <>
                                      <ShieldCheck className="h-3.5 w-3.5 text-blue-500" />
                                      <span className="text-blue-600">{t('chat.roleCoOwner')}</span>
                                    </>
                                  ) : (
                                    <>
                                      <User className="h-3.5 w-3.5 text-muted-foreground" />
                                      <span className="text-muted-foreground">{t('chat.roleMember')}</span>
                                    </>
                                  )}
                                  <ChevronDown className="h-3 w-3 opacity-50" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-35">
                                <DropdownMenuItem 
                                  onClick={() => void handleChangeRole(u.id, MemberRole.MEMBER)}
                                  className="gap-2 text-xs"
                                >
                                  <User className="h-3.5 w-3.5 text-muted-foreground" />
                                    <span>{t('chat.roleMember')}</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => void handleChangeRole(u.id, MemberRole.CO_OWNER)}
                                  className="gap-2 text-xs"
                                >
                                  <ShieldCheck className="h-3.5 w-3.5 text-blue-500" />
                                    <span>{t('chat.roleCoOwner')}</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          ) : (
                            <div className="flex items-center gap-1.5 text-xs font-medium px-2">
                              {isMemberOwner ? (
                                <>
                                  <Crown className="h-3.5 w-3.5 text-amber-500" />
                                    <span className="text-amber-600">{t('chat.roleOwner')}</span>
                                </>
                              ) : isAdmin ? (
                                <>
                                  <ShieldCheck className="h-3.5 w-3.5 text-blue-500" />
                                    <span className="text-blue-600">{t('chat.roleCoOwner')}</span>
                                </>
                              ) : (
                                <>
                                  <User className="h-3.5 w-3.5 text-muted-foreground" />
                                    <span className="text-muted-foreground">{t('chat.roleMember')}</span>
                                </>
                              )}
                            </div>
                          )}

                          {isOwner && u.id !== myId && (
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => void handleTransferOwnership(u.id, name)} 
                              title={t('chat.transferOwnership')}
                              className="h-8 w-8 p-0 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                            >
                              <Crown className="h-4 w-4" />
                            </Button>
                          )}
                          {canKick && (
                            <Button type="button" variant="ghost" size="sm" onClick={() => void handleKick(u.id)} className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
      <ConfirmModal
        open={confirmConfig.open}
        onOpenChange={(v) => setConfirmConfig(prev => ({ ...prev, open: v }))}
        title={confirmConfig.title}
        description={confirmConfig.description}
        onConfirm={confirmConfig.onConfirm}
        isLoading={confirmConfig.isLoading}
        variant={confirmConfig.variant}
      />
    </Dialog>
  )
}
