import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MainLayout from '@/layouts/MainLayout'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route index element={<div className="text-2xl font-bold">欢迎使用健康助手</div>} />
          <Route path="health-profile" element={<div>健康档案</div>} />
          <Route path="medications" element={<div>用药管理</div>} />
          <Route path="medications/:id" element={<div>药品详情</div>} />
          <Route path="visits" element={<div>就诊记录</div>} />
          <Route path="visits/:id" element={<div>就诊详情</div>} />
          <Route path="reports" element={<div>体检报告</div>} />
          <Route path="reports/:id" element={<div>报告详情</div>} />
          <Route path="symptoms" element={<div>症状日记</div>} />
          <Route path="symptoms/:id" element={<div>症状详情</div>} />
          <Route path="share" element={<div>分享报告</div>} />
          <Route path="settings" element={<div>设置</div>} />
          <Route path="*" element={<div className="flex items-center justify-center min-h-[50vh] text-muted-foreground text-lg">页面未找到</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
