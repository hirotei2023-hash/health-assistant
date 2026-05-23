import { useState, useEffect } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, type User } from '@/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

const emptyUser: User = {
  name: '', gender: '', birthDate: '', bloodType: '',
  height: 0, weight: 0, allergies: [], chronicDiseases: [],
  emergencyContact: '', familyHistory: '',
}

export default function HealthProfile() {
  const user = useLiveQuery(() => db.users.toCollection().first())
  const [form, setForm] = useState<User>(emptyUser)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (user) setForm(user)
  }, [user])

  const handleSave = async () => {
    if (user?.id) {
      await db.users.update(user.id, { ...form, allergies: form.allergies, chronicDiseases: form.chronicDiseases })
    } else {
      await db.users.add({ ...form, allergies: form.allergies, chronicDiseases: form.chronicDiseases })
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleArrayInput = (value: string, field: 'allergies' | 'chronicDiseases') => {
    setForm({ ...form, [field]: value.split(/[,，]/).map(s => s.trim()).filter(Boolean) })
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold">🏥 健康档案</h2>
        <p className="text-muted-foreground">管理你的基本健康信息</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>基本信息</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>姓名</Label>
              <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="你的姓名" />
            </div>
            <div className="space-y-2">
              <Label>性别</Label>
              <Input value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })} placeholder="男/女" />
            </div>
            <div className="space-y-2">
              <Label>出生日期</Label>
              <Input type="date" value={form.birthDate} onChange={e => setForm({ ...form, birthDate: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>血型</Label>
              <Input value={form.bloodType} onChange={e => setForm({ ...form, bloodType: e.target.value })} placeholder="A/B/AB/O" />
            </div>
            <div className="space-y-2">
              <Label>身高 (cm)</Label>
              <Input type="number" value={form.height || ''} onChange={e => setForm({ ...form, height: Number(e.target.value) })} />
            </div>
            <div className="space-y-2">
              <Label>体重 (kg)</Label>
              <Input type="number" value={form.weight || ''} onChange={e => setForm({ ...form, weight: Number(e.target.value) })} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>病史信息</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>过敏史（逗号分隔）</Label>
            <Input value={form.allergies.join(', ')} onChange={e => handleArrayInput(e.target.value, 'allergies')} placeholder="如：青霉素, 花粉" />
          </div>
          <div className="space-y-2">
            <Label>慢性病（逗号分隔）</Label>
            <Input value={form.chronicDiseases.join(', ')} onChange={e => handleArrayInput(e.target.value, 'chronicDiseases')} placeholder="如：高血压, 糖尿病" />
          </div>
          <div className="space-y-2">
            <Label>家族病史</Label>
            <Textarea value={form.familyHistory} onChange={e => setForm({ ...form, familyHistory: e.target.value })} placeholder="直系亲属的重大疾病史" />
          </div>
          <div className="space-y-2">
            <Label>紧急联系人</Label>
            <Input value={form.emergencyContact} onChange={e => setForm({ ...form, emergencyContact: e.target.value })} placeholder="姓名 电话" />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-4">
        <Button onClick={handleSave}>保存</Button>
        {saved && <span className="text-sm text-green-600">已保存！</span>}
      </div>
    </div>
  )
}
