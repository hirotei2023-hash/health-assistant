import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Link } from 'react-router-dom'
import { db, type Symptom } from '@/db'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Slider } from '@/components/ui/slider'
import { Plus, Trash2 } from 'lucide-react'

const emptySymptom: Symptom = {
  date: new Date().toISOString().slice(0, 10), symptom: '', severity: 3,
  duration: '', triggers: [], notes: '',
}

export default function Symptoms() {
  const symptoms = useLiveQuery(() => db.symptoms.orderBy('date').reverse().toArray())
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<Symptom>(emptySymptom)

  const handleSave = async () => {
    await db.symptoms.add(form)
    setForm(emptySymptom)
    setOpen(false)
  }

  const handleDelete = async (id: number) => {
    if (confirm('确定删除？')) await db.symptoms.delete(id)
  }

  const severityEmoji = (s: number) => ['', '😊', '😐', '😣', '😫', '🔴'][s]

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">📅 症状日记</h2>
          <p className="text-muted-foreground">记录每日身体状况和症状</p>
        </div>
        <Button onClick={() => { setForm({ ...emptySymptom, date: new Date().toISOString().slice(0, 10) }); setOpen(true) }}>
          <Plus className="w-4 h-4 mr-1" /> 记录症状
        </Button>
      </div>

      {symptoms?.length === 0 && (
        <Card><CardContent className="py-12 text-center text-muted-foreground">
          <p className="text-lg mb-2">还没有症状记录</p>
          <p>每天记录你的身体感受，帮助发现健康规律</p>
        </CardContent></Card>
      )}

      <div className="space-y-3">
        {symptoms?.map((s) => (
          <Card key={s.id}>
            <CardContent className="flex items-center justify-between py-4">
              <Link to={`/symptoms/${s.id}`} className="flex-1">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground w-24">{s.date}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{s.symptom}</h3>
                      <span>{severityEmoji(s.severity)}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      持续 {s.duration || '未知'}
                      {s.triggers.length > 0 && ` · 触发: ${s.triggers.join(', ')}`}
                    </p>
                  </div>
                </div>
              </Link>
              <Button variant="ghost" size="icon" onClick={() => handleDelete(s.id!)}>
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>记录症状</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>日期</Label>
              <Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>症状</Label>
              <Input value={form.symptom} onChange={e => setForm({ ...form, symptom: e.target.value })} placeholder="如：头痛" />
            </div>
            <div className="space-y-2">
              <Label>严重程度 ({form.severity}/5) {severityEmoji(form.severity)}</Label>
              <Slider value={[form.severity]} onValueChange={([v]) => setForm({ ...form, severity: v })} min={1} max={5} step={1} />
            </div>
            <div className="space-y-2">
              <Label>持续时间</Label>
              <Input value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} placeholder="如：2小时 / 一整天" />
            </div>
            <div className="space-y-2">
              <Label>触发因素（逗号分隔）</Label>
              <Input
                value={form.triggers.join(', ')}
                onChange={e => setForm({ ...form, triggers: e.target.value.split(/[,，]/).map(s => s.trim()).filter(Boolean) })}
                placeholder="如：天气变化, 饮食"
              />
            </div>
            <div className="space-y-2">
              <Label>备注</Label>
              <Textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
            </div>
            <Button onClick={handleSave} className="w-full">保存</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
