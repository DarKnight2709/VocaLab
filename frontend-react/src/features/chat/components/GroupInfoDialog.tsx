import { useEffect, useMemo, useRef, useState } from 'react'
import { groupAPI } from '@/api/group.api'
import { userAPI } from '@/api/user.api'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar'
import { Button } from '@/shared/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog'
import { Input } from '@/shared/components/ui/input'
import { GroupEditDialog } from '@/features/chat/components/GroupEditDialog'
import { toast } from 'sonner'

type AnyUser = {
  _id: string
  username?: string
  fullName?: string
  avatar?: string
}

type GroupMember = {
  userId: AnyUser
  role?: 'admin' | 'member'
  joinedAt?: string
}

type GroupInfo = {
  _id: string
  name?: string
  description?: string
  avatar?: string
  owner?: AnyUser
}

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  groupId: string | null
  myId: string
  onAddedMembers?: (memberIds: string[]) => void
  onLeftGroup?: (data: { groupId: string; memberIds: string[] }) => void
  onUpdatedGroup?: (group: { _id: string; name?: string; description?: string; avatar?: string }) => void
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
  const [loading, setLoading] = useState(false)
  const [group, setGroup] = useState<GroupInfo | null>(null)
  const [members, setMembers] = useState<GroupMember[]>([])

  const [editOpen, setEditOpen] = useState(false)

  const [keyword, setKeyword] = useState('')
  const [searching, setSearching] = useState(false)
  const [results, setResults] = useState<AnyUser[]>([])
  const [selectedToAdd, setSelectedToAdd] = useState<AnyUser[]>([])
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const memberIds = useMemo(() => new Set(members.map((m) => m.userId?._id).filter(Boolean)), [members])
  const selectedIds = useMemo(() => new Set(selectedToAdd.map((u) => u._id)), [selectedToAdd])

  useEffect(() => {
    if (!open) return
    setKeyword('')
    setResults([])
    setSelectedToAdd([])
  }, [open])

  useEffect(() => {
    if (!open || !groupId) return

    let cancelled = false
    setLoading(true)

    Promise.all([groupAPI.getInfoGroup(groupId), groupAPI.getMembers(groupId)])
      .then(([infoRes, membersRes]) => {
        if (cancelled) return
        const g = (infoRes.data as any)?.group as GroupInfo | undefined
        const ms = ((membersRes.data as any)?.members as GroupMember[] | undefined) || []
        setGroup(g || null)
        setMembers(ms)
      })
      .catch((e: any) => {
        toast.error(e?.response?.data?.message || 'Không thể tải thông tin nhóm')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [open, groupId])

  useEffect(() => {
    if (!open) return
    if (debounceRef.current) clearTimeout(debounceRef.current)

    const q = keyword.trim()
    if (!q) {
      setResults([])
      return
    }

    debounceRef.current = setTimeout(async () => {
      setSearching(true)
      try {
        const res = await userAPI.searchs(q)
        const users = ((res.data as any)?.users as AnyUser[] | undefined) || []
        setResults(users)
      } catch (e: any) {
        setResults([])
        toast.error(e?.response?.data?.message || 'Lỗi tìm kiếm người dùng')
      } finally {
        setSearching(false)
      }
    }, 450)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [keyword, open])

  function addPick(u: AnyUser) {
    if (memberIds.has(u._id)) return
    if (selectedIds.has(u._id)) return
    setSelectedToAdd((prev) => [...prev, u])
  }

  function removePick(userId: string) {
    setSelectedToAdd((prev) => prev.filter((u) => u._id !== userId))
  }

  async function refreshMembers() {
    if (!groupId) return
    const membersRes = await groupAPI.getMembers(groupId)
    const ms = ((membersRes.data as any)?.members as GroupMember[] | undefined) || []
    setMembers(ms)
  }

  async function refreshGroup() {
    if (!groupId) return
    const infoRes = await groupAPI.getInfoGroup(groupId)
    const g = (infoRes.data as any)?.group as GroupInfo | undefined
    setGroup(g || null)
  }

  async function handleAddMembers() {
    if (!groupId) return
    if (selectedToAdd.length === 0) {
      toast.error('Chọn thành viên để thêm')
      return
    }

    const ids = selectedToAdd.map((u) => u._id)

    try {
      await groupAPI.addMembers(groupId, ids)
      toast.success('Thêm thành viên thành công')
      setSelectedToAdd([])
      setKeyword('')
      setResults([])
      await Promise.all([refreshGroup(), refreshMembers()])
      onAddedMembers?.(ids)
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Thêm thành viên thất bại')
    }
  }

  async function handleLeaveGroup() {
    if (!groupId) return

    try {
      const allMemberIds = members.map((m) => m.userId?._id).filter(Boolean) as string[]
      const isOwner = (group?.owner as any)?._id === myId
      const message = isOwner
        ? 'Bạn chắc chắn muốn xóa nhóm này? Hành động này không thể hoàn tác.'
        : 'Bạn chắc chắn muốn rời nhóm này?'

      // eslint-disable-next-line no-alert
      if (!confirm(message)) return

      await groupAPI.deleteGroup(groupId)
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
      await groupAPI.deleteMember(groupId, memberId)
      toast.success('Đã xóa thành viên')
      await Promise.all([refreshGroup(), refreshMembers()])
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Xóa thành viên thất bại')
    }
  }

  async function handleChangeRole(memberId: string, nextRole: 'admin' | 'member') {
    if (!groupId) return

    const target = members.find((m) => m.userId?._id === memberId)
    const memberName = target?.userId?.fullName || target?.userId?.username || 'Thành viên'
    // eslint-disable-next-line no-alert
    const ok = confirm(`Bạn muốn đổi ${memberName} thành ${nextRole === 'admin' ? 'Admin' : 'Thành viên'}?`)
    if (!ok) return

    try {
      await groupAPI.changeRole(groupId, memberId, nextRole)
      toast.success('Đã cập nhật quyền thành công')
      await Promise.all([refreshGroup(), refreshMembers()])
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Đổi quyền thất bại')
      await Promise.all([refreshGroup(), refreshMembers()])
    }
  }

  const groupName = group?.name || 'Nhóm'
  const groupDesc = group?.description?.trim() ? group?.description : 'Chưa có mô tả'
  const ownerId = (group?.owner as any)?._id as string | undefined

  const myMember = members.find((m) => m.userId?._id === myId)
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
          initial={group ? { _id: group._id, name: group.name, description: group.description, avatar: group.avatar } : null}
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
                      key={u._id}
                      type="button"
                      onClick={() => removePick(u._id)}
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
                      const disabled = memberIds.has(u._id) || selectedIds.has(u._id)
                      return (
                        <div key={u._id} className="flex items-center justify-between gap-3 rounded-md px-2 py-2 hover:bg-muted">
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
                    const isOwner = ownerId && u?._id === ownerId
                    const isAdmin = m.role === 'admin'
                    const canKick =
                      canKickMembers &&
                      u?._id !== myId &&
                      (!ownerId || u?._id !== ownerId)

                    const canRoleChange = canChangeRole && u?._id !== myId

                    return (
                      <div key={u?._id || Math.random()} className="flex items-center justify-between p-3 gap-3">
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
                              onChange={(e) => void handleChangeRole(u._id, e.target.value as 'admin' | 'member')}
                              disabled={u._id === myId}
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
                            <Button type="button" variant="destructive" size="sm" onClick={() => void handleKick(u._id)}>
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
