import { createFileRoute, Outlet, redirect, Link, useNavigate } from '@tanstack/react-router'
import { RefreshCw, Plus, LogOut } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import Account from '../components/mail/Account'
import NewFriendPopup from '../components/NewFriendPopup'
import FriendRequestPopup from '../components/ FriendRequestPopup'
import CreateGroupModal from '../components/mail/CreateGroupModal'

import { asyncGmail } from '../api/mail'
import { Button, Tooltip } from '@mui/material'
import { getCurrentUser, type UserInfo } from '../api/auth'
import { useCreateGroup, useEmailGroups } from '../hooks/useEmailGroups'
import VNPAYCheckoutButton from '../components/VNpay'
import { useNotification } from '../contexts/notification'
import { useSearch } from '@tanstack/react-router'

export const Route = createFileRoute('/mail')({
  beforeLoad: () => {
    const token = localStorage.getItem('accessToken')
    if (!token) {
      throw redirect({ to: '/login' })
    }
    if (location.pathname === '/mail') {
      throw redirect({ to: '/mail/inbox' })
    }
  },
  component: SideBar,
})

function SideBar() {
  const navigate = useNavigate()
  const { success: notifySuccess, error: notifyError } = useNotification()
  const [user, setUser] = useState<UserInfo | null>(null)
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false)
  const token = localStorage.getItem('accessToken')
  const search = useSearch({ from: '/mail' }) as { payment?: string }
  const groupsQuery = useEmailGroups()
  const createGroupMutation = useCreateGroup()
  const queryClient = useQueryClient()

  const meQuery = useQuery({
    queryKey: ['me'],
    queryFn: () => getCurrentUser(token || ''),
    enabled: !!token,
    retry: false,
  })

  useEffect(() => {
    if (meQuery.data) {
      setUser(meQuery.data)
      localStorage.setItem('email', meQuery.data.email)
    }
    if (meQuery.error) {
      console.error('Lỗi đồng bộ thông tin user profile:', meQuery.error)
    }
  }, [meQuery.data, meQuery.error])

  useEffect(() => {
    if (search.payment === 'success') {
      notifySuccess('Thanh toán thành công!')
    }
    if (search.payment === 'failed') {
      notifyError('Thanh toán thất bại!')
    }
  }, [search.payment, notifyError, notifySuccess])

  const handleSyncEmails = async () => {
    try {
      confirm('Bạn có chắc chắn muốn đồng bộ email không?')
      await asyncGmail(20)
      notifySuccess('Đồng bộ thành công!')
      // Invalidate inbox query so React Query refetches and avoids duplicate direct calls
      await queryClient.invalidateQueries({ queryKey: ['inbox'] })
    } catch (error) {
      console.error('Lỗi đồng bộ:', error)
      notifyError('Đồng bộ thất bại!')
    }

  }
  const logOut = () => {
    localStorage.removeItem('accessToken');
    // Sử dụng navigate của TanStack Router thay vì window.location.href để tránh reload page
    navigate({ to: '/login' });
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[oklch(0.16_0.01_260)] text-[oklch(0.92_0.01_260)] font-sans text-[13px]">
      <aside className="flex h-full w-64 shrink-0 flex-col border-r border-[oklch(0.24_0.01_260)] bg-[oklch(0.15_0.01_260)]">
        <div className="flex items-center justify-between px-3 py-2.5">
          <Link to="/mail/new" className="flex items-center gap-1.5 rounded-md bg-[oklch(0.55_0.18_255)] px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-[oklch(0.6_0.18_255)]">
            <Plus className="h-3.5 w-3.5" /> Thư mới
          </Link>
          <Tooltip title="Đồng bộ email" arrow>
            <button onClick={handleSyncEmails} className="flex items-center gap-1.5 rounded px-3 py-1.5 text-[oklch(0.7_0.01_260)] hover:bg-[oklch(0.22_0.01_260)]">
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          </Tooltip>
          <NewFriendPopup />
          <FriendRequestPopup />
        </div>

        <div className="flex-1 overflow-y-auto px-2 py-1">
          <Account
            email={user?.email || 'Đang tải...'}
            totalEmails={user?.total_emails || 0}
            totalStarred={user?.total_starred || 0}
            totalDeleted={user?.total_deleted || 0}
            expanded={true}
            emailGroups={groupsQuery.data || []}
            onCreateGroup={() => setIsCreateGroupOpen(true)}
          />
        </div>

        <CreateGroupModal
          open={isCreateGroupOpen}
          onClose={() => setIsCreateGroupOpen(false)}
          onSave={async (payload) => {
            await createGroupMutation.mutateAsync(payload)
          }}
        />

        <div className="border-t border-[oklch(0.24_0.01_260)] p-3 space-y-2">
          <VNPAYCheckoutButton />
          <Button
            className="w-full justify-start text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
            onClick={logOut}
          >
            <LogOut className="h-4 w-4 mr-2" /> Đăng xuất
          </Button>
        </div>

      </aside>

      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>
    </div>
  )
}
