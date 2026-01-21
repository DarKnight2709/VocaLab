import { useEffect, useMemo, useRef, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { useSearchUsersQuery } from '@/features/chat/api/chatService'
import { useCreateGroupMutation } from '@/features/chat/api/groupService'
import { toast } from 'sonner'
import type { UserItem } from '@/shared/validations/ChatSchema'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated?: (created: { groupId: string; memberIds: string[] }) => void
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

export function GroupCreateDialog({ open, onOpenChange, onCreated }: Props) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [keyword, setKeyword] = useState('')
  const [searching, setSearching] = useState(false)
  const [results, setResults] = useState<UserItem[]>([])
  const [selected, setSelected] = useState<UserItem[]>([])
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const createGroupMutation = useCreateGroupMutation()

  useEffect(() => {
    if (!open) return
    // reset on open
    setName('')
    setDescription('')
    setKeyword('')
    setResults([])
    setSelected([])
  }, [open])

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

  const selectedIds = useMemo(() => new Set(selected.map((u) => u.id)), [selected])

  function addMember(u: UserItem) {
    if (selectedIds.has(u.id)) return
    setSelected((prev) => [...prev, u])
  }

  function removeMember(userId: string) {
    setSelected((prev) => prev.filter((u) => u.id !== userId))
  }

  async function handleCreate() {
    const trimmed = name.trim()
    if (!trimmed) {
      toast.error('Tên nhóm không được để trống')
      return
    }

    if (selected.length < 2) {
      toast.error('Chọn ít nhất 2 thành viên (ngoài bạn)')
      return
    }

    try {
      const memberIds = selected.map((u) => u.id)
      const data = await createGroupMutation.mutateAsync({
        name: trimmed,
        description: description.trim(),
        members: memberIds,
      })

      const groupId = (data as any)?.group?.id as string | undefined
      toast.success((data as any)?.message || 'Tạo nhóm thành công')
      onOpenChange(false)
      if (groupId) onCreated?.({ groupId, memberIds })
    } catch (e: any) {
      toast.error(e?.response?.data?.message || e?.message || 'Tạo nhóm thất bại')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Tạo nhóm</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="text-sm font-medium">Tên nhóm</div>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nhập tên nhóm" />
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium">Mô tả (tuỳ chọn)</div>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Nhập mô tả nhóm"
            />
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium">Thêm thành viên</div>
            <Input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Tìm theo username..."
            />

            {selected.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selected.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => removeMember(u.id)}
                    className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm hover:bg-muted"
                    title="Bấm để xoá"
                  >
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs">
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

            <div className="rounded-lg border p-2 max-h-64 overflow-auto">
              {searching ? (
                <div className="text-sm text-muted-foreground p-2">Đang tìm...</div>
              ) : results.length === 0 ? (
                <div className="text-sm text-muted-foreground p-2">{keyword.trim() ? 'Không có kết quả' : 'Nhập từ khoá để tìm'}</div>
              ) : (
                <div className="space-y-2">
                  {results.map((u) => {
                    const disabled = selectedIds.has(u.id)
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
                        <Button size="sm" variant={disabled ? 'secondary' : 'default'} disabled={disabled} onClick={() => addMember(u)}>
                          {disabled ? 'Đã thêm' : 'Thêm'}
                        </Button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Huỷ
            </Button>
            <Button onClick={handleCreate}>Tạo nhóm</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
