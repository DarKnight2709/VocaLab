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
import { getErrorMessage } from '@/shared/lib/api'
import { useGroupInfoQuery } from '@/features/chat/api/groupService'
import { useGroupMembersQuery } from '@/features/chat/api/groupService'
import {
  useAddGroupMembersMutation,
  useChangeGroupRoleMutation,
  useDeleteGroupMemberMutation,
  useDeleteGroupMutation,
} from '@/features/chat/api/groupService'
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
  const deleteMemberMutation = useDeleteGroupMemberMutation()
  const changeRoleMutation = useChangeGroupRoleMutation()

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
      toast.error('Chọn thành viên để thêm')
      return
    }

    const ids = selectedToAdd.map((u) => u.id)

    try {
      await addMembersMutation.mutateAsync({ groupId, memberIds: ids })
      toast.success('Thêm thành viên thành công')
      setSelectedToAdd([])
      setKeyword('')
      setResults([])
      onAddedMembers?.()
    } catch (e: any) {
      toast.error(getErrorMessage(e, 'Thêm thành viên thất bại'))
    }
  }

  async function handleLeaveGroup() {
    if (!groupId) return

    const isOwner = (group?.owner as any)?.id === myId
    const title = isOwner ? 'Xóa nhóm' : 'Rời nhóm'
    const description = isOwner
      ? 'Bạn chắc chắn muốn xóa nhóm này? Hành động này không thể hoàn tác.'
      : 'Bạn chắc chắn muốn rời nhóm này?'

    setConfirmConfig({
      open: true,
      title,
      description,
      isLoading: false,
      variant: isOwner ? "destructive" : "default",
      onConfirm: async () => {
        try {
          setConfirmConfig(prev => ({ ...prev, isLoading: true }))
          await deleteGroupMutation.mutateAsync(groupId)
          toast.success(isOwner ? 'Xóa nhóm thành công' : 'Rời nhóm thành công')
          setConfirmConfig(prev => ({ ...prev, open: false }))
          onOpenChange(false)
          onLeftGroup?.()
        } catch (e: any) {
          toast.error(getErrorMessage(e, 'Rời nhóm thất bại'))
          setConfirmConfig(prev => ({ ...prev, isLoading: false, open: false }))
        }
      }
    })
  }

  async function handleKick(memberId: string) {
    if (!groupId) return

    const target = members.find((m) => m.user?.id === memberId)
    const memberName = target?.user?.fullName || target?.user?.username || 'Thành viên'

    setConfirmConfig({
      open: true,
      title: 'Xóa thành viên',
      description: `Bạn chắc chắn muốn xóa ${memberName} khỏi nhóm?`,
      isLoading: false,
      variant: "destructive",
      onConfirm: async () => {
        try {
          setConfirmConfig(prev => ({ ...prev, isLoading: true }))
          await deleteMemberMutation.mutateAsync({ groupId, memberId })
          toast.success('Đã xóa thành viên')
          setConfirmConfig(prev => ({ ...prev, open: false }))
        } catch (e: any) {
          toast.error(getErrorMessage(e, 'Xóa thành viên thất bại'))
          setConfirmConfig(prev => ({ ...prev, isLoading: false, open: false }))
        }
      }
    })
  }

  async function handleChangeRole(memberId: string, nextRole: MemberRole) {
    if (!groupId) return

    const target = members.find((m) => m.user?.id === memberId)
    const memberName = target?.user?.fullName || target?.user?.username || 'Thành viên'
    const roleName = nextRole === MemberRole.CO_OWNER ? 'Phó nhóm' : 'Thành viên'

    setConfirmConfig({
      open: true,
      title: 'Đổi quyền',
      description: `Bạn muốn đổi ${memberName} thành ${roleName}?`,
      isLoading: false,
      onConfirm: async () => {
        try {
          setConfirmConfig(prev => ({ ...prev, isLoading: true }))
          await changeRoleMutation.mutateAsync({ groupId, memberId, role: nextRole })
          toast.success('Đã cập nhật quyền thành công')
          setConfirmConfig(prev => ({ ...prev, open: false }))
        } catch (e: any) {
          toast.error(getErrorMessage(e, 'Đổi quyền thất bại'))
          setConfirmConfig(prev => ({ ...prev, isLoading: false, open: false }))
        }
      }
    })
  }

  const groupName = group?.name || 'Nhóm'
  const groupDesc = group?.description?.trim() ? group?.description : 'Chưa có mô tả'
  const ownerId = (group?.owner as any)?.id as string | undefined

  const isOwner = !!ownerId && ownerId === myId

  const canEditGroup = isOwner
  const canChangeRole = isOwner
  const canKickMembers = isOwner
  const canAddMembers = isOwner

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Thông tin nhóm</DialogTitle>
        </DialogHeader>

        <GroupEditDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          groupId={groupId}
          initial={group ? { id: group.id, name: group.name, description: group.description, avatar: group.avatar } : null}
          onUpdated={(g) => {
            setGroup((prev) => (prev ? { ...prev, ...g } : (g as any)))
            onUpdatedGroup?.(g as any)
          }}
        />

        {loading ? (
          <div className="text-sm text-muted-foreground">Đang tải...</div>
        ) : !groupId ? (
          <div className="text-sm text-muted-foreground">Chưa chọn nhóm</div>
        ) : (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={group?.avatar} />
                <AvatarFallback>{initials(groupName)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <div className="font-semibold truncate">{groupName}</div>
                <div className="text-sm text-muted-foreground truncate">{groupDesc}</div>
              </div>
            </div>

             
            <div className="space-y-2">
              <div className="font-medium">Hành động</div>
              <div className="flex gap-2">
                {canEditGroup && (
                  <Button type="button" variant="outline" size="sm" onClick={() => setEditOpen(true)} className="h-9">
                    <Pencil className="mr-2 h-4 w-4 text-primary" />
                    Sửa nhóm
                  </Button>
                )}
                <Button 
                  type="button" 
                  variant={isOwner ? 'destructive' : 'outline'} 
                  size="sm" 
                  onClick={handleLeaveGroup}
                  className="h-9"
                >
                  {isOwner ? (
                    <>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Xóa nhóm
                    </>
                  ) : (
                    <>
                      <LogOut className="mr-2 h-4 w-4" />
                      Rời nhóm
                    </>
                  )}
                </Button>
              </div>
            </div>

            {canAddMembers && (
              <div className="space-y-2">
                <div className="font-medium flex items-center gap-2">
                  <UserPlus className="h-4 w-4 text-primary" />
                  Thêm thành viên
                </div>
                {selectedToAdd.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedToAdd.map((u) => (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => removePick(u.id)}
                        className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm hover:bg-muted"
                        title="Bấm để xoá"
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
                      placeholder="Tìm theo tên hoặc username..." 
                      className="h-9"
                    />
                    <Button type="button" onClick={handleAddMembers} disabled={selectedToAdd.length === 0} size="sm">
                      Thêm
                    </Button>
                  </div>

                  {(searching || keyword.trim() !== '') && (
                    <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-lg border bg-popover p-2 shadow-xl max-h-56 overflow-auto">
                      {searching ? (
                        <div className="text-sm text-muted-foreground p-2">Đang tìm...</div>
                      ) : results.length === 0 ? (
                        <div className="text-sm text-muted-foreground p-2">Không có kết quả</div>
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
                                  {disabled ? 'Đã thêm' : 'Chọn'}
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
              <div className="font-medium">Danh sách thành viên ({members.length})</div>
              <div className="rounded-lg border divide-y">
                {members.length === 0 ? (
                  <div className="p-3 text-sm text-muted-foreground">Chưa có thành viên</div>
                ) : (
                  members.map((m) => {
                    const u = m.user
                    const name = u?.fullName || u?.username || 'User'
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
                            <AvatarImage src={u?.avatar} />
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
                                      <span className="text-blue-600">Phó nhóm</span>
                                    </>
                                  ) : (
                                    <>
                                      <User className="h-3.5 w-3.5 text-muted-foreground" />
                                      <span className="text-muted-foreground">Thành viên</span>
                                    </>
                                  )}
                                  <ChevronDown className="h-3 w-3 opacity-50" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-[140px]">
                                <DropdownMenuItem 
                                  onClick={() => void handleChangeRole(u.id, MemberRole.MEMBER)}
                                  className="gap-2 text-xs"
                                >
                                  <User className="h-3.5 w-3.5 text-muted-foreground" />
                                  <span>Thành viên</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => void handleChangeRole(u.id, MemberRole.CO_OWNER)}
                                  className="gap-2 text-xs"
                                >
                                  <ShieldCheck className="h-3.5 w-3.5 text-blue-500" />
                                  <span>Phó nhóm</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          ) : (
                            <div className="flex items-center gap-1.5 text-xs font-medium px-2">
                              {isMemberOwner ? (
                                <>
                                  <Crown className="h-3.5 w-3.5 text-amber-500" />
                                  <span className="text-amber-600">Chủ nhóm</span>
                                </>
                              ) : isAdmin ? (
                                <>
                                  <ShieldCheck className="h-3.5 w-3.5 text-blue-500" />
                                  <span className="text-blue-600">Phó nhóm</span>
                                </>
                              ) : (
                                <>
                                  <User className="h-3.5 w-3.5 text-muted-foreground" />
                                  <span className="text-muted-foreground">Thành viên</span>
                                </>
                              )}
                            </div>
                          )}

                          {canKick && (
                            <Button type="button" variant="destructive" size="sm" onClick={() => void handleKick(u.id)}>
                              Kick
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
