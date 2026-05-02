import Sidebar from '@/components/layout/Sidebar'
import Topbar from '@/components/layout/Topbar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-stone-100">
      <Sidebar />
      <Topbar />
      <main
        style={{
          marginLeft: 'var(--sidebar-width)',
          paddingTop: 'var(--topbar-height)',
        }}
        className="min-h-screen"
      >
        <div className="p-7">
          {children}
        </div>
      </main>
    </div>
  )
}
