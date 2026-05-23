import { useParams, useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Check, X } from 'lucide-react'

export default function MedicationDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const medication = useLiveQuery(() => db.medications.get(Number(id)), [id])
  const logs = useLiveQuery(() =>
    db.medicationLogs.where('medicationId').equals(Number(id)).reverse().sortBy('takenAt'), [id]
  )

  const handleTake = async () => {
    if (!medication?.id) return
    await db.medicationLogs.add({
      medicationId: medication.id,
      takenAt: new Date().toISOString(),
      skipped: false,
      notes: '',
    })
  }

  const handleSkip = async () => {
    if (!medication?.id) return
    await db.medicationLogs.add({
      medicationId: medication.id,
      takenAt: new Date().toISOString(),
      skipped: true,
      notes: '',
    })
  }

  if (!medication) return null

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Button variant="ghost" onClick={() => navigate('/medications')}>
        <ArrowLeft className="w-4 h-4 mr-1" /> 返回
      </Button>

      <div>
        <h2 className="text-2xl font-bold">{medication.name}</h2>
        <p className="text-muted-foreground">{medication.dosage} · {medication.frequency}</p>
      </div>

      <Card>
        <CardContent className="py-4 space-y-2">
          <div className="flex justify-between"><span className="text-muted-foreground">状态</span><Badge variant={medication.status === 'active' ? 'default' : 'secondary'}>{medication.status === 'active' ? '服用中' : '已停用'}</Badge></div>
          <div className="flex justify-between"><span className="text-muted-foreground">开始</span><span>{medication.startDate}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">结束</span><span>{medication.endDate || '未设定'}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">备注</span><span>{medication.notes || '无'}</span></div>
        </CardContent>
      </Card>

      {medication.status === 'active' && (
        <div className="flex gap-3">
          <Button onClick={handleTake} className="flex-1"><Check className="w-4 h-4 mr-1" /> 已服药</Button>
          <Button onClick={handleSkip} variant="outline" className="flex-1"><X className="w-4 h-4 mr-1" /> 跳过</Button>
        </div>
      )}

      <Card>
        <CardHeader><CardTitle>服药记录</CardTitle></CardHeader>
        <CardContent>
          {logs?.length === 0 && <p className="text-muted-foreground text-center py-4">暂无服药记录</p>}
          <div className="space-y-2">
            {logs?.map(log => (
              <div key={log.id} className="flex items-center justify-between py-2 border-b last:border-0">
                <span className="text-sm">{new Date(log.takenAt).toLocaleString('zh-CN')}</span>
                <Badge variant={log.skipped ? 'destructive' : 'default'}>
                  {log.skipped ? '已跳过' : '已服用'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
