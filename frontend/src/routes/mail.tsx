import { createFileRoute, Outlet, redirect, Link } from '@tanstack/react-router'
import { RefreshCw, Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import Account from '../components/mail/Account'
import NewFriendPopup from '../components/NewFriendPopup'
import FriendRequestPopup from '../components/ FriendRequestPopup'
import CreateGroupModal from '../components/mail/CreateGroupModal'

import { asyncGmail, getInbox } from '../api/mail'
import { Tooltip } from '@mui/material'
import { getCurrentUser, type UserInfo } from '../api/auth'
import { useCreateGroup, useEmailGroups } from '../hooks/useEmailGroups'

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
  const [user, setUser] = useState<UserInfo | null>(null)
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false)
  const token = localStorage.getItem('accessToken')
  const groupsQuery = useEmailGroups()
  const createGroupMutation = useCreateGroup()

  useEffect(() => {
    if (!token) return

    getCurrentUser(token)
      .then((userData) => {
        setUser(userData)
        localStorage.setItem('email', userData.email)
      })
      .catch((err) => console.error('Lỗi đồng bộ thông tin user profile:', err))
  }, [token])

  const handleSyncEmails = async () => {
    try {
      confirm('Bạn có chắc chắn muốn đồng bộ email không?')
      await asyncGmail(20)
      alert('Đồng bộ thành công!')
      await getInbox(1, 20)
    } catch (error) {
      console.error('Lỗi đồng bộ:', error)
      alert('Đồng bộ thất bại!')
    }
  }

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
      </aside>

      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>
    </div>
  )
}
