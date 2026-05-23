import { Outlet, NavLink, useLocation } from 'react-router-dom'
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarFooter,
} from '@/components/ui/sidebar'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Menu } from 'lucide-react'

const menuItems = [
  { to: '/', label: '首页', icon: '📋' },
  { to: '/health-profile', label: '健康档案', icon: '🏥' },
  { to: '/medications', label: '用药管理', icon: '💊' },
  { to: '/visits', label: '就诊记录', icon: '🩺' },
  { to: '/reports', label: '体检报告', icon: '📊' },
  { to: '/symptoms', label: '症状日记', icon: '📅' },
  { to: '/share', label: '分享报告', icon: '🔗' },
  { to: '/settings', label: '设置', icon: '⚙️' },
]

export default function MainLayout() {
  const location = useLocation()

  const SidebarNav = () => (
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.to}>
                <SidebarMenuButton asChild isActive={location.pathname === item.to}>
                  <NavLink to={item.to}>
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
  )

  return (
    <SidebarProvider defaultOpen>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex">
        <Sidebar collapsible="none">
          <SidebarHeader>
            <h1 className="text-lg font-bold px-4 py-2">🏥 健康助手</h1>
          </SidebarHeader>
          <SidebarNav />
          <SidebarFooter>
            <p className="text-xs text-muted-foreground px-4 py-2">数据仅存储于本地</p>
          </SidebarFooter>
        </Sidebar>
      </div>

      {/* Mobile Sheet Sidebar */}
      <Sheet>
        <SheetTrigger asChild className="md:hidden fixed top-4 left-4 z-50">
          <Button variant="outline" size="icon">
            <Menu className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-60 p-0">
          <div className="py-4 px-4 border-b">
            <h1 className="text-lg font-bold">🏥 健康助手</h1>
          </div>
          <nav className="flex flex-col gap-1 p-2">
            {menuItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                    isActive ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted'
                  }`
                }
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6 pt-16 md:pt-6 overflow-auto">
        <Outlet />
      </main>
    </SidebarProvider>
  )
}
