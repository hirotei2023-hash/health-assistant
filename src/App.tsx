import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MainLayout from '@/layouts/MainLayout'
import Dashboard from '@/pages/Dashboard'
import HealthProfile from '@/pages/HealthProfile'
import Medications from '@/pages/Medications'
import MedicationDetail from '@/pages/MedicationDetail'
import Visits from '@/pages/Visits'
import VisitDetail from '@/pages/VisitDetail'
import Reports from '@/pages/Reports'
import ReportDetail from '@/pages/ReportDetail'
import Symptoms from '@/pages/Symptoms'
import SymptomDetail from '@/pages/SymptomDetail'
import Share from '@/pages/Share'
import Settings from '@/pages/Settings'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="health-profile" element={<HealthProfile />} />
          <Route path="medications" element={<Medications />} />
          <Route path="medications/:id" element={<MedicationDetail />} />
          <Route path="visits" element={<Visits />} />
          <Route path="visits/:id" element={<VisitDetail />} />
          <Route path="reports" element={<Reports />} />
          <Route path="reports/:id" element={<ReportDetail />} />
          <Route path="symptoms" element={<Symptoms />} />
          <Route path="symptoms/:id" element={<SymptomDetail />} />
          <Route path="share" element={<Share />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<div className="flex items-center justify-center min-h-[50vh] text-muted-foreground text-lg">页面未找到</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
