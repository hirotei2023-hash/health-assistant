import { useParams, useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default function SymptomDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const symptom = useLiveQuery(() => db.symptoms.get(Number(id)), [id])

  if (!symptom) return null

  const severityEmoji = (s: number) => ['', '😊', '😐', '😣', '😫', '🔴'][s]

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Button variant="ghost" onClick={() => navigate('/symptoms')}>
        <ArrowLeft className="w-4 h-4 mr-1" /> 返回
      </Button>

      <div>
        <h2 className="text-2xl font-bold">{symptom.symptom}</h2>
        <p className="text-muted-foreground">{symptom.date}</p>
      </div>

      <Card>
        <CardHeader><CardTitle>详情</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span className="text-muted-foreground">严重程度</span>
            <span className="text-xl">{severityEmoji(symptom.severity)} {symptom.severity}/5</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">持续时间</span>
            <span>{symptom.duration || '未记录'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">触发因素</span>
            <span>{symptom.triggers.length > 0 ? symptom.triggers.join(', ') : '未记录'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">备注</span>
            <span>{symptom.notes || '无'}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
