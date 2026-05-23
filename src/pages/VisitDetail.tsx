import { useParams, useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default function VisitDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const visit = useLiveQuery(() => db.visits.get(Number(id)), [id])

  if (!visit) return null

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Button variant="ghost" onClick={() => navigate('/visits')}>
        <ArrowLeft className="w-4 h-4 mr-1" /> 返回
      </Button>

      <div>
        <h2 className="text-2xl font-bold">{visit.hospital}</h2>
        <p className="text-muted-foreground">{visit.department} · {visit.doctor} · {visit.date}</p>
      </div>

      <Card>
        <CardHeader><CardTitle>就诊原因</CardTitle></CardHeader>
        <CardContent><p>{visit.reason || '无'}</p></CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>诊断结果</CardTitle></CardHeader>
        <CardContent><p>{visit.diagnosis || '无'}</p></CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>处方</CardTitle></CardHeader>
        <CardContent><p>{visit.prescription || '无'}</p></CardContent>
      </Card>
    </div>
  )
}
