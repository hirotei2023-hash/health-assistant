import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Link } from 'react-router-dom'
import { db, type HealthReport } from '@/db'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2 } from 'lucide-react'

const emptyReport: HealthReport = {
  date: new Date().toISOString().slice(0, 10), title: '', hospital: '', items: [],
}

export default function Reports() {
  const reports = useLiveQuery(() => db.reports.orderBy('date').reverse().toArray())
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<HealthReport>(emptyReport)
  const [itemsText, setItemsText] = useState('')

  const handleSave = async () => {
    const items = itemsText.split('\n').filter(Boolean).map(line => {
      const [name, value, unit, range] = line.split(/[,，\t]/).map(s => s.trim())
      const numVal = parseFloat(value)
      const [low, high] = (range || '').split('-').map(Number)
      return {
        name, value, unit,
        range: range || '',
        abnormal: !isNaN(numVal) && !isNaN(low) && !isNaN(high) && (numVal < low || numVal > high),
      }
    })
    await db.reports.add({ ...form, items })
    setForm(emptyReport)
    setItemsText('')
    setOpen(false)
  }

  const handleDelete = async (id: number) => {
    if (confirm('确定删除？')) await db.reports.delete(id)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">📊 体检报告</h2>
          <p className="text-muted-foreground">管理体检报告和指标追踪</p>
        </div>
        <Button onClick={() => { setForm({ ...emptyReport, date: new Date().toISOString().slice(0, 10) }); setOpen(true) }}>
          <Plus className="w-4 h-4 mr-1" /> 添加报告
        </Button>
      </div>

      {reports?.length === 0 && (
        <Card><CardContent className="py-12 text-center text-muted-foreground">
          <p className="text-lg mb-2">还没有体检报告</p>
          <p>点击「添加报告」录入你的体检数据，系统会自动标注异常项</p>
        </CardContent></Card>
      )}

      <div className="space-y-3">
        {reports?.map((r) => {
          const abnormalCount = r.items.filter(i => i.abnormal).length
          return (
            <Card key={r.id}>
              <CardContent className="flex items-center justify-between py-4">
                <Link to={`/reports/${r.id}`} className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground w-24">{r.date}</span>
                    <div>
                      <h3 className="font-semibold">{r.title}</h3>
                      <p className="text-sm text-muted-foreground">{r.hospital} · {r.items.length} 项指标</p>
                    </div>
                    {abnormalCount > 0 && <Badge variant="destructive">{abnormalCount} 项异常</Badge>}
                  </div>
                </Link>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(r.id!)}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[80vh] overflow-auto">
          <DialogHeader><DialogTitle>添加体检报告</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>报告日期</Label>
              <Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>报告标题</Label>
              <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="如：年度体检" />
            </div>
            <div className="space-y-2">
              <Label>医院</Label>
              <Input value={form.hospital} onChange={e => setForm({ ...form, hospital: e.target.value })} placeholder="体检医院" />
            </div>
            <div className="space-y-2">
              <Label>检查指标（每行一项：名称,数值,单位,参考范围）</Label>
              <textarea
                className="flex min-h-[120px] w-full rounded-md border bg-transparent px-3 py-2 text-sm"
                value={itemsText}
                onChange={e => setItemsText(e.target.value)}
                placeholder={"白细胞,6.5,10^9/L,3.5-9.5\n红细胞,5.2,10^12/L,4.3-5.8\n血糖,6.8,mmol/L,3.9-6.1"}
              />
            </div>
            <Button onClick={handleSave} className="w-full">保存</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
