import { useLiveQuery } from 'dexie-react-hooks'
import { Link } from 'react-router-dom'
import { db } from '@/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function Dashboard() {
  const user = useLiveQuery(() => db.users.toCollection().first())
  const medications = useLiveQuery(() => db.medications.where('status').equals('active').toArray())
  const recentVisits = useLiveQuery(() => db.visits.orderBy('date').reverse().limit(3).toArray())
  const recentSymptoms = useLiveQuery(() => db.symptoms.orderBy('date').reverse().limit(3).toArray())
  const recentReports = useLiveQuery(() => db.reports.orderBy('date').reverse().limit(3).toArray())

  const cards = [
    { to: '/health-profile', icon: '🏥', title: '健康档案', desc: user?.name ? `${user.name} · ${user.bloodType || '未知血型'}` : '点击完善健康档案', highlight: !user?.name },
    { to: '/medications', icon: '💊', title: '用药管理', desc: medications?.length ? `${medications.length} 种药品服用中` : '暂无服药记录', highlight: false },
    { to: '/visits', icon: '🩺', title: '就诊记录', desc: recentVisits?.length ? `最近: ${recentVisits[0].hospital}` : '暂无就诊记录', highlight: false },
    { to: '/reports', icon: '📊', title: '体检报告', desc: recentReports?.length ? `${recentReports.length} 份报告` : '暂无体检报告', highlight: false },
    { to: '/symptoms', icon: '📅', title: '症状日记', desc: recentSymptoms?.length ? `最近: ${recentSymptoms[0].symptom}` : '暂无症状记录', highlight: false },
    { to: '/share', icon: '🔗', title: '分享报告', desc: '导出健康报告给医生', highlight: false },
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold">👋 欢迎回来</h2>
        <p className="text-muted-foreground">{user?.name ? `${user.name}，关注你的健康每一天` : '开始记录你的健康数据吧'}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => (
          <Link key={card.to} to={card.to}>
            <Card className={`h-full hover:shadow-md transition-shadow ${card.highlight ? 'ring-2 ring-primary/50' : ''}`}>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{card.icon}</span>
                  <CardTitle className="text-base">{card.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{card.desc}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Summary */}
      {user?.name && (
        <Card>
          <CardHeader><CardTitle>📋 健康摘要</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{user.bloodType || '-'}</div>
                <div className="text-xs text-muted-foreground">血型</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{user.height || '-'}</div>
                <div className="text-xs text-muted-foreground">身高 (cm)</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{user.weight || '-'}</div>
                <div className="text-xs text-muted-foreground">体重 (kg)</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{user.allergies?.length || 0}</div>
                <div className="text-xs text-muted-foreground">过敏项</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reminders */}
      {medications && medications.length > 0 && (
        <Card>
          <CardHeader><CardTitle>💊 今日用药提醒</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {medications.map(m => (
                <div key={m.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <span className="font-medium">{m.name}</span>
                    <span className="text-sm text-muted-foreground ml-2">{m.dosage} · {m.frequency}</span>
                  </div>
                  <Link to={`/medications/${m.id}`} className="text-sm text-primary hover:underline">记录</Link>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
