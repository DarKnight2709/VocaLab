import { useEffect, useMemo, useRef, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar'
import { Button } from '@/shared/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog'
import { Input } from '@/shared/components/ui/input'
import { toast } from 'sonner'
import { useUpdateGroupMutation } from '@/features/chat/api/groupService'
import type { GroupItem } from '@/shared/validations/GroupSchema'

type GroupInfo = Partial<GroupItem> & { id: string }

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  groupId: string | null
  initial?: GroupInfo | null
  onUpdated?: (group: GroupInfo) => void
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

export function GroupEditDialog({ open, onOpenChange, groupId, initial, onUpdated }: Props) {
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [group, setGroup] = useState<GroupInfo | null>(initial || null)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [avatarBase64, setAvatarBase64] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const groupName = useMemo(() => group?.name || 'Nhóm', [group])
  const updateGroupMutation = useUpdateGroupMutation()

  useEffect(() => {
    if (!open) return
    setAvatarBase64(null)

    if (initial) {
      setGroup(initial)
      setName(initial.name || '')
      setDescription(initial.description || '')
      return
    }

    // If we don't have initial data, just show loading=false; fetching is handled by GroupInfoDialog and passed via `initial`.
    // This keeps UI simple and avoids duplicating group info fetch here.
    if (!groupId) return
    setLoading(false)
  }, [open, groupId, initial])

  async function handlePickFile(file: File) {
    const reader = new FileReader()
    const base64 = await new Promise<string>((resolve, reject) => {
      reader.onload = () => resolve(String(reader.result || ''))
      reader.onerror = () => reject(new Error('read_failed'))
      reader.readAsDataURL(file)
    })
    setAvatarBase64(base64)
  }

  async function handleSave() {
    if (!groupId) return
    const trimmed = name.trim()
    if (!trimmed) {
      toast.error('Tên nhóm không được để trống')
      return
    }

    const payload: Record<string, unknown> = {
      name: trimmed,
      description: description,
    }
    if (avatarBase64) payload.avatar = avatarBase64

    try {
      setSaving(true)
      const data = await updateGroupMutation.mutateAsync({ groupId, payload })
      const updated = ((data as any)?.group as GroupInfo | undefined) || {
        id: groupId,
        name: trimmed,
        description,
        avatar: avatarBase64 || group?.avatar,
      }
      toast.success((data as any)?.message || 'Cập nhật thành công')
      setGroup(updated)
      onUpdated?.(updated)
      onOpenChange(false)
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Cập nhật nhóm thất bại')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa nhóm</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="text-sm text-muted-foreground">Đang tải...</div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="rounded-full"
                onClick={() => fileInputRef.current?.click()}
                title="Đổi ảnh nhóm"
              >
                <Avatar className="h-14 w-14">
                  <AvatarImage src={avatarBase64 || group?.avatar} />
                  <AvatarFallback>{initials(groupName)}</AvatarFallback>
                </Avatar>
              </button>
              <div className="text-sm text-muted-foreground">Bấm avatar để đổi ảnh</div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) void handlePickFile(f)
                }}
              />
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">Tên nhóm</div>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nhập tên nhóm" />
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">Mô tả</div>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Nhập mô tả" />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
                Huỷ
              </Button>
              <Button type="button" onClick={handleSave} disabled={saving || !groupId}>
                {saving ? 'Đang lưu...' : 'Lưu'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
