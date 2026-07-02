// Trong file mail.tsx
import { createFileRoute, Outlet, redirect, Link } from '@tanstack/react-router'
import { Cloud, RefreshCw, Plus } from 'lucide-react'
import { useState, useEffect } from 'react' // BỔ SUNG IMPORT STATE/EFFECT
import Account from '../components/mail/Account'
import PopupHeadless  from '../components/PopupHeadless'
import { asyncGmail, getInbox } from '../api/mail'
import { Tooltip } from '@mui/material';
import { getCurrentUser, type UserInfo } from '../api/auth' // BỔ SUNG IMPORT HÀM API

export const Route = createFileRoute('/mail')({
  beforeLoad: () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      throw redirect({ to: "/login" });
    }
    if (location.pathname === "/mail") {
      throw redirect({ to: "/mail/inbox" });
    }
  },
  component: SideBar,
})

function SideBar() {
  // 1. Khởi tạo state để lưu thông tin User động
  const [user, setUser] = useState<UserInfo | null>(null);
  const token = localStorage.getItem("accessToken");
  // 2. useEffect tự động gọi API lấy thông tin khi vào trang
  useEffect(() => {
    if (!token) return;

    getCurrentUser(token)
      .then((userData) => {
        setUser(userData);
        // Lưu email vào localStorage
        localStorage.setItem("email", userData.email);
      })
      .catch((err) => {
        console.error("Lỗi đồng bộ thông tin user profile:", err);
        // Nếu token hết hạn hoặc lỗi 401, có thể xử lý xóa token và đá về login tại đây
      });

  }, [token]);

  const handleSyncEmails = async () => {
    try {
      confirm("Bạn có chắc chắn muốn đồng bộ email không?")
      await asyncGmail(20);
      alert("Đồng bộ thành công!");
      await getInbox(1, 20);
    } catch (error) {
      console.error("Lỗi đồng bộ:", error);
      alert("Đồng bộ thất bại!");
    }
  };

  // const handleAddFriend = async () => {
    
  // }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[oklch(0.16_0.01_260)] text-[oklch(0.92_0.01_260)] font-sans text-[13px]">
      <aside className="w-64 shrink-0 border-r border-[oklch(0.24_0.01_260)] bg-[oklch(0.15_0.01_260)] flex flex-col h-full">
        <div className="flex items-center justify-between px-3 py-2.5">
          <button className="p-1.5 rounded hover:bg-[oklch(0.22_0.01_260)] text-[oklch(0.7_0.01_260)]"><Cloud className="w-4 h-4" /></button>
          <Link to="/mail/new" className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[oklch(0.55_0.18_255)] hover:bg-[oklch(0.6_0.18_255)] text-white text-xs font-medium shadow-sm">
            <Plus className="w-3.5 h-3.5" /> Thư mới
          </Link>
          <Tooltip title="Đồng bộ email" arrow>
            <button onClick={handleSyncEmails} className="flex items-center gap-1.5 px-3 py-1.5 rounded hover:bg-[oklch(0.22_0.01_260)] text-[oklch(0.7_0.01_260)]">
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </Tooltip>
          <Tooltip title="Thêm bạn bè" arrow>
            <PopupHeadless />
          </Tooltip>
        </div>

        <div className="px-2 py-1 overflow-y-auto flex-1">
          {/* 3. TRUYỀN DỮ LIỆU ĐỘNG TỪ STATE VÀO COMPONENT ACCOUNT */}
          <Account
            email={user?.email || "Đang tải..."}
            totalEmails={user?.total_emails || 0}
            totalStarred={user?.total_starred || 0}
            totalDeleted={user?.total_deleted || 0}
            expanded={true}
          />
        </div>
      </aside>

      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}