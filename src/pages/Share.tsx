import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { jsPDF } from 'jspdf'
import { saveAs } from 'file-saver'
import { db } from '@/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'

const modules = [
  { key: 'profile', label: '健康档案' },
  { key: 'medications', label: '用药管理' },
  { key: 'visits', label: '就诊记录' },
  { key: 'reports', label: '体检报告' },
  { key: 'symptoms', label: '症状日记' },
]

export default function Share() {
  const user = useLiveQuery(() => db.users.toCollection().first())
  const [selectedModules, setSelectedModules] = useState<string[]>(['profile', 'medications', 'visits', 'reports', 'symptoms'])
  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date()
    d.setMonth(d.getMonth() - 6)
    return d.toISOString().slice(0, 10)
  })
  const [dateTo, setDateTo] = useState(() => new Date().toISOString().slice(0, 10))
  const [password, setPassword] = useState('')

  const toggleModule = (key: string) => {
    setSelectedModules(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    )
  }

  const generatePDF = async () => {
    const doc = new jsPDF()
    let y = 20

    doc.setFontSize(18)
    doc.text('个人健康报告', 20, y)
    y += 10
    doc.setFontSize(12)
    doc.text(`导出日期: ${new Date().toLocaleDateString('zh-CN')}`, 20, y)
    doc.text(`时间范围: ${dateFrom} ~ ${dateTo}`, 120, y)
    y += 10

    if (password) {
      doc.setFontSize(10)
      doc.text('此文件已设置密码保护', 20, y)
      y += 10
    }

    // Health Profile
    if (selectedModules.includes('profile') && user) {
      doc.setFontSize(14)
      doc.text('健康档案', 20, y)
      y += 8
      doc.setFontSize(11)
      doc.text(`姓名: ${user.name}    性别: ${user.gender}    出生日期: ${user.birthDate}`, 25, y)
      y += 7
      doc.text(`血型: ${user.bloodType}    身高: ${user.height}cm    体重: ${user.weight}kg`, 25, y)
      y += 7
      doc.text(`过敏史: ${user.allergies.join(', ') || '无'}`, 25, y)
      y += 7
      doc.text(`慢性病: ${user.chronicDiseases.join(', ') || '无'}`, 25, y)
      y += 7
      doc.text(`家族病史: ${user.familyHistory || '无'}`, 25, y)
      y += 10
    }

    // Medications
    if (selectedModules.includes('medications')) {
      const meds = await db.medications.toArray()
      doc.setFontSize(14)
      doc.text('用药记录', 20, y)
      y += 8
      doc.setFontSize(11)
      if (meds.length === 0) {
        doc.text('无用药记录', 25, y)
        y += 7
      } else {
        meds.forEach(m => {
          doc.text(`${m.name} — ${m.dosage} ${m.frequency} (${m.status === 'active' ? '服用中' : '已停用'})`, 25, y)
          y += 7
        })
      }
      y += 5
    }

    // Visits
    if (selectedModules.includes('visits')) {
      const visits = await db.visits.where('date').between(dateFrom, dateTo, true, true).toArray()
      doc.setFontSize(14)
      doc.text('就诊记录', 20, y)
      y += 8
      doc.setFontSize(11)
      if (visits.length === 0) {
        doc.text('该时间段内无就诊记录', 25, y)
        y += 7
      } else {
        visits.forEach(v => {
          doc.text(`${v.date} — ${v.hospital} ${v.department} ${v.doctor}`, 25, y)
          y += 7
          if (v.diagnosis) {
            doc.text(`  诊断: ${v.diagnosis}`, 25, y)
            y += 7
          }
        })
      }
      y += 5
    }

    // Reports
    if (selectedModules.includes('reports')) {
      const reports = await db.reports.where('date').between(dateFrom, dateTo, true, true).toArray()
      doc.setFontSize(14)
      doc.text('体检报告', 20, y)
      y += 8
      doc.setFontSize(11)
      if (reports.length === 0) {
        doc.text('该时间段内无体检报告', 25, y)
        y += 7
      } else {
        reports.forEach(r => {
          doc.text(`${r.date} — ${r.title} (${r.hospital})`, 25, y)
          y += 7
          r.items.forEach(item => {
            doc.text(`  ${item.name}: ${item.value} ${item.unit} [${item.range}] ${item.abnormal ? '⚠️异常' : '正常'}`, 30, y)
            y += 6
          })
        })
      }
      y += 5
    }

    // Symptoms
    if (selectedModules.includes('symptoms')) {
      const symptoms = await db.symptoms.where('date').between(dateFrom, dateTo, true, true).toArray()
      doc.setFontSize(14)
      doc.text('症状日记', 20, y)
      y += 8
      doc.setFontSize(11)
      if (symptoms.length === 0) {
        doc.text('该时间段内无症状记录', 25, y)
      } else {
        symptoms.forEach(s => {
          doc.text(`${s.date} — ${s.symptom} 严重度: ${s.severity}/5 持续: ${s.duration}`, 25, y)
          y += 7
        })
      }
    }

    // Save
    const blob = doc.output('blob')
    saveAs(blob, `健康报告_${dateFrom}_${dateTo}.pdf`)

    // Save export record
    await db.exports.add({
      createdAt: new Date().toISOString(),
      dateRange: { from: dateFrom, to: dateTo },
      modules: selectedModules,
      format: 'PDF',
      hasPassword: !!password,
    })
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold">🔗 分享报告</h2>
        <p className="text-muted-foreground">导出健康数据为 PDF，方便给医生查看</p>
      </div>

      <Card>
        <CardHeader><CardTitle>选择导出内容</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {modules.map(mod => (
              <div key={mod.key} className="flex items-center space-x-2">
                <Checkbox
                  id={mod.key}
                  checked={selectedModules.includes(mod.key)}
                  onCheckedChange={() => toggleModule(mod.key)}
                />
                <Label htmlFor={mod.key}>{mod.label}</Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>时间范围</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>开始日期</Label>
              <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>结束日期</Label>
              <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>安全设置（可选）</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label>PDF 密码（留空则不设密码）</Label>
            <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="建议设置密码保护隐私" />
          </div>
        </CardContent>
      </Card>

      <Button onClick={generatePDF} size="lg" className="w-full">
        生成并下载 PDF 报告
      </Button>
    </div>
  )
}
