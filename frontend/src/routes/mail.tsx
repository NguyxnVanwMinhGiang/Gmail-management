import { createFileRoute, Outlet , redirect } from '@tanstack/react-router'
import { Cloud, MoreHorizontal, Plus} from 'lucide-react'
import Account from '../components/mail/Account'



export const Route = createFileRoute('/mail')({
  beforeLoad: () => {
    // Nếu người dùng truy cập /mail, tự động chuyển hướng đến /mail/inbox
    if (location.pathname === "/mail") {
      throw redirect({
        to: "/mail/inbox",
      });
    }
  },
  component: SideBar,
})


function SideBar() {
  return (
    // Sử dụng h-screen và overflow-hidden ở gốc để cố định khung app không bị cuộn toàn trang
    <div className="flex h-screen w-screen overflow-hidden bg-[oklch(0.16_0.01_260)] text-[oklch(0.92_0.01_260)] font-sans text-[13px]">
      {/* Sidebar - cố định chiều rộng w-64 */}
      <aside className="w-64 shrink-0 border-r border-[oklch(0.24_0.01_260)] bg-[oklch(0.15_0.01_260)] flex flex-col h-full">
        <div className="flex items-center justify-between px-3 py-2.5">
          <button className="p-1.5 rounded hover:bg-[oklch(0.22_0.01_260)] text-[oklch(0.7_0.01_260)]"><Cloud className="w-4 h-4" /></button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[oklch(0.55_0.18_255)] hover:bg-[oklch(0.6_0.18_255)] text-white text-xs font-medium shadow-sm">
            <Plus className="w-3.5 h-3.5" /> Thư mới
          </button>
          <button className="p-1.5 rounded hover:bg-[oklch(0.22_0.01_260)] text-[oklch(0.7_0.01_260)]"><MoreHorizontal className="w-4 h-4" /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-1.5 pb-2">
          <Account name="nguyengiang21102005@gmail.com" expanded/>
        </div>
      </aside>

      {/* Main content area - chiếm trọn không gian còn lại */}
      <main className="flex-1 flex flex-col min-w-0 h-full bg-[oklch(0.18_0.01_260)]">
          <Outlet />
      </main>
    </div>
  )
}

{/* 
<div className="flex items-center justify-between px-5 py-3 shrink-0 border-b border-[oklch(0.24_0.01_260)]">
  <div className="flex items-center gap-2">
    <Mail className="w-4 h-4 text-[oklch(0.7_0.01_260)]" />
    <span className="font-medium">nguyengiang21102005@gmail.com</span>
  </div>
  <button className="flex items-center gap-1.5 text-xs text-[oklch(0.75_0.01_260)] hover:text-white">
    <Settings className="w-3.5 h-3.5" /> Cài đặt tài khoản
  </button>
</div> 

<div className="flex items-center gap-1 px-3 py-2 shrink-0 border-b border-[oklch(0.24_0.01_260)]">
  <TabBtn icon={Mail} label="Đọc thư" />
  <TabBtn icon={PenSquare} label="Viết thư mới" />
  <TabBtn icon={Search} label="Tìm kiếm thư" />
  <TabBtn icon={Filter} label="Quản lí bộ lọc thư" />
  <TabBtn icon={Lock} label="Mã hoá đầu cuối" />
</div>
function TabBtn({ icon: Icon, label }: { icon: any; label: string }) {
  return (
    <button className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm text-[oklch(0.8_0.01_260)] hover:bg-[oklch(0.22_0.01_260)] whitespace-nowrap">
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}

*/}