import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Link } from 'react-router-dom'
import { db, type Visit } from '@/db'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Plus, Trash2 } from 'lucide-react'

const emptyVisit: Visit = {
  date: new Date().toISOString().slice(0, 10), hospital: '', department: '',
  doctor: '', reason: '', diagnosis: '', prescription: '', attachments: [],
}

export default function Visits() {
  const visits = useLiveQuery(() => db.visits.orderBy('date').reverse().toArray())
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<Visit>(emptyVisit)

  const handleSave = async () => {
    await db.visits.add(form)
    setForm(emptyVisit)
    setOpen(false)
  }

  const handleDelete = async (id: number) => {
    if (confirm('确定删除？')) await db.visits.delete(id)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">🩺 就诊记录</h2>
          <p className="text-muted-foreground">记录每次就医的详细信息</p>
        </div>
        <Button onClick={() => { setForm({ ...emptyVisit, date: new Date().toISOString().slice(0, 10) }); setOpen(true) }}>
          <Plus className="w-4 h-4 mr-1" /> 添加记录
        </Button>
      </div>

      {visits?.length === 0 && (
        <Card><CardContent className="py-12 text-center text-muted-foreground">
          <p className="text-lg mb-2">还没有就诊记录</p>
          <p>点击「添加记录」开始记录你的就医信息</p>
        </CardContent></Card>
      )}

      <div className="space-y-3">
        {visits?.map((v) => (
          <Card key={v.id}>
            <CardContent className="flex items-center justify-between py-4">
              <Link to={`/visits/${v.id}`} className="flex-1">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground w-24">{v.date}</span>
                    <div>
                      <h3 className="font-semibold">{v.hospital}</h3>
                      <p className="text-sm text-muted-foreground">{v.department} · {v.doctor}</p>
                    </div>
                  </div>
                </div>
              </Link>
              <Button variant="ghost" size="icon" onClick={() => handleDelete(v.id!)}>
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[80vh] overflow-auto">
          <DialogHeader><DialogTitle>添加就诊记录</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>就诊日期</Label>
              <Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>医院</Label>
                <Input value={form.hospital} onChange={e => setForm({ ...form, hospital: e.target.value })} placeholder="医院名称" />
              </div>
              <div className="space-y-2">
                <Label>科室</Label>
                <Input value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} placeholder="如：内科" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>医生</Label>
              <Input value={form.doctor} onChange={e => setForm({ ...form, doctor: e.target.value })} placeholder="医生姓名" />
            </div>
            <div className="space-y-2">
              <Label>就诊原因</Label>
              <Textarea value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} placeholder="描述你的症状或就诊原因" />
            </div>
            <div className="space-y-2">
              <Label>诊断结果</Label>
              <Textarea value={form.diagnosis} onChange={e => setForm({ ...form, diagnosis: e.target.value })} placeholder="医生的诊断" />
            </div>
            <div className="space-y-2">
              <Label>处方</Label>
              <Textarea value={form.prescription} onChange={e => setForm({ ...form, prescription: e.target.value })} placeholder="处方内容" />
            </div>
            <Button onClick={handleSave} className="w-full">保存</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
