import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchUsersQuery } from '@/features/chat/api/chatService'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar'
import { Button } from '@/shared/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog'
import { Input } from '@/shared/components/ui/input'
import { GroupEditDialog } from '@/features/chat/components/GroupEditDialog'
import { toast } from 'sonner'
import { useGroupInfoQuery } from '@/features/chat/api/groupService'
import { useGroupMembersQuery } from '@/features/chat/api/groupService'
import {
  useAddGroupMembersMutation,
  useChangeGroupRoleMutation,
  useDeleteGroupMemberMutation,
  useDeleteGroupMutation,
} from '@/features/chat/api/groupService'
import type { UserItem } from '@/shared/validations/ChatSchema'
import type { GroupItem } from '@/shared/validations/GroupSchema'

type GroupMember = {
  userId: UserItem
  role?: 'admin' | 'member'
  joinedAt?: string
}

type GroupInfo = Partial<GroupItem> & {
  id: string
  owner?: UserItem
}

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  groupId: string | null
  myId: string
  onAddedMembers?: (memberIds: string[]) => void
  onLeftGroup?: (data: { groupId: string; memberIds: string[] }) => void
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
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const memberIds = useMemo(() => new Set(members.map((m) => m.userId?.id).filter(Boolean)), [members])
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
  }, [open, groupId])

  useEffect(() => {
    if (!open) return
    if (debounceRef.current) clearTimeout(debounceRef.current)

    const q = keyword.trim()
    if (!q) {
      setResults([])
      return
    }


    // Sử dụng hook useSearchUsersQuery thay cho userAPI.searchs
    const { data: searchResults, isLoading } = useSearchUsersQuery(q);
    setSearching(isLoading);
    setResults(searchResults || []);
  // Không cần debounce nữa, hook đã tự động quản lý
  }, [keyword, open])

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
      onAddedMembers?.(ids)
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Thêm thành viên thất bại')
    }
  }

  async function handleLeaveGroup() {
    if (!groupId) return

    try {
      const allMemberIds = members.map((m) => m.userId?.id).filter(Boolean) as string[]
      const isOwner = (group?.owner as any)?.id === myId
      const message = isOwner
        ? 'Bạn chắc chắn muốn xóa nhóm này? Hành động này không thể hoàn tác.'
        : 'Bạn chắc chắn muốn rời nhóm này?'

      // eslint-disable-next-line no-alert
      if (!confirm(message)) return

      await deleteGroupMutation.mutateAsync(groupId)
      toast.success(isOwner ? 'Xóa nhóm thành công' : 'Rời nhóm thành công')
      onOpenChange(false)
      onLeftGroup?.({ groupId, memberIds: allMemberIds })
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Rời nhóm thất bại')
    }
  }

  async function handleKick(memberId: string) {
    if (!groupId) return
    // eslint-disable-next-line no-alert
    if (!confirm('Bạn chắc chắn muốn xóa thành viên này?')) return

    try {
      await deleteMemberMutation.mutateAsync({ groupId, memberId })
      toast.success('Đã xóa thành viên')
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Xóa thành viên thất bại')
    }
  }

  async function handleChangeRole(memberId: string, nextRole: 'admin' | 'member') {
    if (!groupId) return

    const target = members.find((m) => m.userId?.id === memberId)
    const memberName = target?.userId?.fullName || target?.userId?.username || 'Thành viên'
    // eslint-disable-next-line no-alert
    const ok = confirm(`Bạn muốn đổi ${memberName} thành ${nextRole === 'admin' ? 'Admin' : 'Thành viên'}?`)
    if (!ok) return

    try {
      await changeRoleMutation.mutateAsync({ groupId, memberId, role: nextRole })
      toast.success('Đã cập nhật quyền thành công')
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Đổi quyền thất bại')
    }
  }

  const groupName = group?.name || 'Nhóm'
  const groupDesc = group?.description?.trim() ? group?.description : 'Chưa có mô tả'
  const ownerId = (group?.owner as any)?.id as string | undefined

  const myMember = members.find((m) => m.userId?.id === myId)
  const isOwner = !!ownerId && ownerId === myId
  const isAdmin = myMember?.role === 'admin'
  const hasAllPermissions = isOwner && isAdmin
  const hasAdminPermissions = isAdmin && !isOwner
  const canEditGroup = hasAllPermissions || hasAdminPermissions
  const canChangeRole = hasAllPermissions
  const canKickMembers = isAdmin

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
            onUpdatedGroup?.(g)
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
                  <Button type="button" variant="outline" onClick={() => setEditOpen(true)}>
                    ✏️ Sửa nhóm
                  </Button>
                )}
                <Button type="button" variant={isOwner ? 'destructive' : 'outline'} onClick={handleLeaveGroup}>
                  {isOwner ? '🗑️ Xóa nhóm' : '👋 Rời nhóm'}
                </Button>
              </div>
              {canChangeRole && (
                <div className="text-xs text-muted-foreground">Bạn là chủ nhóm (có thể đổi quyền thành viên).</div>
              )}
              {canEditGroup && !canChangeRole && (
                <div className="text-xs text-muted-foreground">Bạn là admin (có thể sửa nhóm, xóa thành viên).</div>
              )}
            </div>

            <div className="space-y-2">
              <div className="font-medium">➕ Thêm thành viên</div>
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
                      <span className="text-muted-foreground">×</span>
                    </button>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <Input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="Tìm theo username..." />
                <Button type="button" onClick={handleAddMembers} disabled={selectedToAdd.length === 0}>
                  Thêm
                </Button>
              </div>

              <div className="rounded-lg border p-2 max-h-56 overflow-auto">
                {searching ? (
                  <div className="text-sm text-muted-foreground p-2">Đang tìm...</div>
                ) : results.length === 0 ? (
                  <div className="text-sm text-muted-foreground p-2">{keyword.trim() ? 'Không có kết quả' : 'Nhập từ khoá để tìm'}</div>
                ) : (
                  <div className="space-y-2">
                    {results.map((u) => {
                      const disabled = memberIds.has(u.id) || selectedIds.has(u.id)
                      return (
                        <div key={u.id} className="flex items-center justify-between gap-3 rounded-md px-2 py-2 hover:bg-muted">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                              {u.avatar ? (
                                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                                // @ts-ignore
                                <img src={u.avatar} className="h-9 w-9 object-cover" />
                              ) : (
                                <span className="text-sm font-semibold">{initials(u.fullName || u.username)}</span>
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="font-medium truncate">{u.fullName || u.username}</div>
                              <div className="text-xs text-muted-foreground truncate">@{u.username || ''}</div>
                            </div>
                          </div>
                          <Button size="sm" variant={disabled ? 'secondary' : 'default'} disabled={disabled} onClick={() => addPick(u)}>
                            {disabled ? 'Đã thêm' : 'Chọn'}
                          </Button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="font-medium">Danh sách thành viên ({members.length})</div>
              <div className="rounded-lg border divide-y">
                {members.length === 0 ? (
                  <div className="p-3 text-sm text-muted-foreground">Chưa có thành viên</div>
                ) : (
                  members.map((m) => {
                    const u = m.userId
                    const name = u?.fullName || u?.username || 'User'
                    const isOwner = ownerId && u?.id === ownerId
                    const isAdmin = m.role === 'admin'
                    const canKick =
                      canKickMembers &&
                      u?.id !== myId &&
                      (!ownerId || u?.id !== ownerId)

                    const canRoleChange = canChangeRole && u?.id !== myId

                    return (
                      <div key={u?.id || Math.random()} className="flex items-center justify-between p-3 gap-3">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={u?.avatar} />
                            <AvatarFallback>{initials(name)}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <div className="font-medium truncate">{name} {isOwner ? '👑' : ''}</div>
                            <div className="text-xs text-muted-foreground truncate">@{u?.username || ''}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {canRoleChange ? (
                            <select
                              className="h-9 rounded-md border bg-background px-2 text-sm"
                              value={m.role || 'member'}
                              onChange={(e) => void handleChangeRole(u.id, e.target.value as 'admin' | 'member')}
                              disabled={u.id === myId}
                            >
                              <option value="member">Thành viên</option>
                              <option value="admin">Admin</option>
                            </select>
                          ) : (
                            <div className="text-xs text-muted-foreground">
                              {isAdmin ? '👑 Admin' : '👤 Thành viên'}
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
    </Dialog>
  )
}
