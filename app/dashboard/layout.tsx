import Sidebar from '@/components/layout/Sidebar'
import Topbar from '@/components/layout/Topbar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F2F2F2' }}>
      <Sidebar />
      <Topbar />
      <main style={{ marginLeft: 'var(--sidebar-width)', paddingTop: 'var(--topbar-height)' }}>
        <div style={{ padding: '32px 36px' }}>
          {children}
        </div>
      </main>
    </div>
  )
}