import { useState, useRef } from 'react'
import { db } from '@/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, Upload, Trash2, AlertTriangle } from 'lucide-react'

export default function Settings() {
  const [message, setMessage] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleExport = async () => {
    try {
      const data = {
        users: await db.users.toArray(),
        medications: await db.medications.toArray(),
        medicationLogs: await db.medicationLogs.toArray(),
        visits: await db.visits.toArray(),
        reports: await db.reports.toArray(),
        symptoms: await db.symptoms.toArray(),
        exports: await db.exports.toArray(),
        exportedAt: new Date().toISOString(),
      }
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `健康助手_数据备份_${new Date().toISOString().slice(0, 10)}.json`
      a.click()
      URL.revokeObjectURL(url)
      setMessage('数据已导出')
      setTimeout(() => setMessage(''), 3000)
    } catch {
      setMessage('导出失败')
    }
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const text = await file.text()
      const data = JSON.parse(text)

      if (!confirm('导入将覆盖当前所有数据，确定继续？')) return

      await db.transaction('rw', [db.users, db.medications, db.medicationLogs, db.visits, db.reports, db.symptoms, db.exports], async () => {
        await db.users.clear()
        await db.medications.clear()
        await db.medicationLogs.clear()
        await db.visits.clear()
        await db.reports.clear()
        await db.symptoms.clear()
        await db.exports.clear()

        if (data.users) await db.users.bulkAdd(data.users)
        if (data.medications) await db.medications.bulkAdd(data.medications)
        if (data.medicationLogs) await db.medicationLogs.bulkAdd(data.medicationLogs)
        if (data.visits) await db.visits.bulkAdd(data.visits)
        if (data.reports) await db.reports.bulkAdd(data.reports)
        if (data.symptoms) await db.symptoms.bulkAdd(data.symptoms)
        if (data.exports) await db.exports.bulkAdd(data.exports)
      })

      setMessage('数据已恢复，页面即将刷新')
      setTimeout(() => window.location.reload(), 2000)
    } catch {
      setMessage('导入失败：文件格式不正确')
    }
  }

  const handleClearAll = async () => {
    if (!confirm('此操作不可撤销！确定要清除所有数据吗？')) return
    if (!confirm('再次确认：清除所有健康数据？')) return

    await db.transaction('rw', [db.users, db.medications, db.medicationLogs, db.visits, db.reports, db.symptoms, db.exports], async () => {
      await db.users.clear()
      await db.medications.clear()
      await db.medicationLogs.clear()
      await db.visits.clear()
      await db.reports.clear()
      await db.symptoms.clear()
      await db.exports.clear()
    })

    setMessage('所有数据已清除')
    setTimeout(() => window.location.reload(), 1500)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold">⚙️ 设置</h2>
        <p className="text-muted-foreground">管理数据备份和隐私设置</p>
      </div>

      <Card>
        <CardHeader><CardTitle>数据备份</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            将全部健康数据导出为 JSON 文件。建议定期备份，避免浏览器数据清除时丢失信息。
          </p>
          <Button onClick={handleExport} className="w-full">
            <Download className="w-4 h-4 mr-2" /> 导出全量数据 (JSON)
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>数据恢复</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            从之前导出的备份文件恢复数据。注意：当前数据将被覆盖。
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
          <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="w-full">
            <Upload className="w-4 h-4 mr-2" /> 导入备份文件
          </Button>
        </CardContent>
      </Card>

      <Card className="border-destructive/30">
        <CardHeader><CardTitle className="text-destructive flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" /> 危险操作
        </CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            清除所有本地存储的健康数据。此操作不可撤销。
          </p>
          <Button variant="destructive" onClick={handleClearAll} className="w-full">
            <Trash2 className="w-4 h-4 mr-2" /> 清除所有数据
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>隐私说明</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>🔒 所有数据存储在你的浏览器本地，不会上传到任何服务器。</p>
            <p>🗑️ 清除浏览器缓存/数据可能导致数据丢失，请定期导出备份。</p>
            <p>📱 换设备时需要手动导出/导入数据。</p>
          </div>
        </CardContent>
      </Card>

      {message && (
        <div className="fixed bottom-4 right-4 bg-primary text-primary-foreground px-4 py-2 rounded-md shadow-lg animate-in">
          {message}
        </div>
      )}
    </div>
  )
}
