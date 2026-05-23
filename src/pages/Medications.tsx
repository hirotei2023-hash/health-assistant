import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Link } from 'react-router-dom'
import { db, type Medication } from '@/db'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Plus, Pencil } from 'lucide-react'

const emptyMedication: Medication = {
  name: '', dosage: '', frequency: '', startDate: '', endDate: '',
  reminderEnabled: false, reminderTimes: [], notes: '', status: 'active',
}

export default function Medications() {
  const medications = useLiveQuery(() => db.medications.toArray())
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<Medication>(emptyMedication)
  const [editId, setEditId] = useState<number | null>(null)

  const openNew = () => {
    setForm(emptyMedication)
    setEditId(null)
    setOpen(true)
  }

  const openEdit = (m: Medication) => {
    setForm({ ...m })
    setEditId(m.id ?? null)
    setOpen(true)
  }

  const handleSave = async () => {
    if (editId) {
      await db.medications.update(editId, { ...form, reminderTimes: form.reminderTimes })
    } else {
      await db.medications.add({ ...form, reminderTimes: form.reminderTimes })
    }
    setOpen(false)
  }

  const handleDelete = async (id: number) => {
    if (confirm('确定删除？')) {
      await db.medications.delete(id)
      await db.medicationLogs.where('medicationId').equals(id).delete()
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">💊 用药管理</h2>
          <p className="text-muted-foreground">管理你的药品清单和服药记录</p>
        </div>
        <Button onClick={openNew}><Plus className="w-4 h-4 mr-1" /> 添加药品</Button>
      </div>

      {medications?.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <p className="text-lg mb-2">还没有添加药品</p>
            <p>点击「添加药品」开始记录你的用药信息</p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {medications?.map((m) => (
          <Card key={m.id} className="hover:shadow-sm transition-shadow">
            <CardContent className="flex items-center justify-between py-4">
              <Link to={`/medications/${m.id}`} className="flex-1">
                <div className="flex items-center gap-3">
                  <div>
                    <h3 className="font-semibold">{m.name}</h3>
                    <p className="text-sm text-muted-foreground">{m.dosage} · {m.frequency}</p>
                  </div>
                </div>
              </Link>
              <div className="flex items-center gap-2">
                <Badge variant={m.status === 'active' ? 'default' : 'secondary'}>
                  {m.status === 'active' ? '服用中' : '已停用'}
                </Badge>
                <Button variant="ghost" size="icon" onClick={() => openEdit(m)}>
                  <Pencil className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editId ? '编辑药品' : '添加药品'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>药品名称</Label>
              <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="如：阿莫西林" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>剂量</Label>
                <Input value={form.dosage} onChange={e => setForm({ ...form, dosage: e.target.value })} placeholder="如：500mg" />
              </div>
              <div className="space-y-2">
                <Label>频次</Label>
                <Input value={form.frequency} onChange={e => setForm({ ...form, frequency: e.target.value })} placeholder="如：每日3次" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>开始日期</Label>
                <Input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>结束日期</Label>
                <Input type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>备注</Label>
              <Input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="饭前/饭后等注意事项" />
            </div>
            <div className="flex justify-end gap-2">
              {editId && <Button variant="destructive" onClick={() => { handleDelete(editId); setOpen(false) }}>删除</Button>}
              <Button onClick={handleSave}>{editId ? '更新' : '添加'}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
