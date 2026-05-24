import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, type HealthReport } from '@/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ArrowLeft } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

function ItemTrends({ report }: { report: HealthReport }) {
  const [allReports, setAllReports] = useState<HealthReport[]>([])

  useEffect(() => {
    db.reports.orderBy('date').toArray().then(setAllReports)
  }, [])

  return (
    <div className="space-y-6">
      {report.items.map((item, idx) => {
        const trendData = allReports
          .filter(r => r.items.some(i => i.name === item.name))
          .map(r => {
            const match = r.items.find(i => i.name === item.name)
            return { date: r.date, value: match ? parseFloat(match.value) || null : null }
          })
          .filter(d => d.value !== null)

        if (trendData.length < 2) return null

        return (
          <Card key={idx}>
            <CardHeader><CardTitle>{item.name} 历史趋势</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} name={item.unit} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

export default function ReportDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const report = useLiveQuery(() => db.reports.get(Number(id)), [id])

  if (!report) return null

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Button variant="ghost" onClick={() => navigate('/reports')}>
        <ArrowLeft className="w-4 h-4 mr-1" /> 返回
      </Button>

      <div>
        <h2 className="text-2xl font-bold">{report.title}</h2>
        <p className="text-muted-foreground">{report.hospital} · {report.date}</p>
      </div>

      <Card>
        <CardHeader><CardTitle>指标详情</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>项目</TableHead>
                <TableHead>结果</TableHead>
                <TableHead>单位</TableHead>
                <TableHead>参考范围</TableHead>
                <TableHead>状态</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {report.items.map((item, idx) => (
                <TableRow key={idx}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.value}</TableCell>
                  <TableCell>{item.unit}</TableCell>
                  <TableCell>{item.range}</TableCell>
                  <TableCell>
                    <Badge variant={item.abnormal ? 'destructive' : 'secondary'}>
                      {item.abnormal ? '异常' : '正常'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {report.items.length > 0 && <ItemTrends report={report} />}
    </div>
  )
}
