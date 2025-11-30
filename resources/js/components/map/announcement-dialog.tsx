import * as React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  roadId: number | null
  onCreate?: (announcement: any) => void
}

export function AnnouncementDialog({ open, onOpenChange, roadId, onCreate }: Props) {
  const [description, setDescription] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!open) {
      setDescription('')
      setError(null)
      setLoading(false)
    }
  }, [open])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!roadId) return setError('No road selected')
    setLoading(true)
    setError(null)

    try {
      const tokenEl = document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement | null
      const token = tokenEl?.getAttribute('content') || ''

      const res = await fetch('/api/announcements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': token,
          Accept: 'application/json',
        },
        credentials: 'same-origin',
        body: JSON.stringify({ road_id: roadId, description }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.message || 'Failed to create announcement')
      }

      const created = await res.json()
      onCreate && onCreate(created)
      onOpenChange(false)
    } catch (err: any) {
      setError(err.message || 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Announcement</DialogTitle>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <input type="hidden" name="road_id" value={roadId ?? ''} />
          <input type="hidden" name="user_id" value="" />

          <div>
            <Label className="mb-1">Description</Label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} required />
          </div>

          {error && <div className="text-sm text-destructive">{error}</div>}

          <DialogFooter>
            <div className="flex gap-2 w-full">
              {/* <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
                Cancel
              </Button> */}
              <Button type="submit" className="ml-auto" disabled={loading}>
                {loading ? 'Saving...' : 'Submit'}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default AnnouncementDialog
