import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { ChevronDown, ChevronRight, Mail, Inbox, Send, AlertOctagon, Trash2, Star } from 'lucide-react'

interface AccountProps {
  email: string;
  totalEmails: number;
  totalStarred: number;
  totalDeleted: number;
  expanded?: boolean;
  emailGroups?: Array<{ id: number; name: string; color: string; description?: string | null }>;
  onCreateGroup?: () => void;
}

function Account({ email, totalEmails, totalStarred, totalDeleted, expanded, emailGroups = [], onCreateGroup }: AccountProps) {
  const [open, setOpen] = useState(!!expanded);

  const dynamicItems = [
    { icon: Inbox, label: "Hộp thư", count: totalEmails, to: "/mail/inbox" },
    { icon: Send, label: "Thư đã gửi", to: "/mail/sent" },
    { icon: Send, label: "Thư từ bạn bè", to: "/mail/friends" },
    { icon: AlertOctagon, label: "Thư rác", to: "/mail/spam" },
    { icon: Trash2, label: "Thùng rác", count: totalDeleted, to: "/mail/trash" },
    { icon: Star, label: "Quan trọng", count: totalStarred, to: "/mail/important", accent: "amber" },
  ]

  return (
    <div className="mb-1">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center gap-1.5 px-2 py-1.5 rounded hover:bg-[oklch(0.22_0.01_260)] text-sm font-semibold text-left justify-between">
        <div className="flex items-center gap-1.5 min-w-0">
          <Mail className="w-4 h-4 text-[oklch(0.7_0.01_260)] shrink-0" />
          <div className="flex flex-col truncate">
            {email && <span className="text-[10px] text-[oklch(0.6_0.01_260)] font-normal truncate">{email}</span>}
          </div>
        </div>
        {open ? <ChevronDown className="w-3.5 h-3.5 shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 shrink-0" />}
      </button>

      {open && (
        <div className="mt-0.5 ml-2 pl-2 border-l border-[oklch(0.24_0.01_260)] space-y-0.5">
          {dynamicItems.map((item, idx) => {
            const IconComponent = item.icon
            return (
              <Link key={idx} to={item.to} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-[oklch(0.22_0.01_260)] text-[oklch(0.8_0.01_260)] text-left justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <IconComponent className={`w-4 h-4 shrink-0 ${item.accent === "amber" ? "text-amber-500" : ""}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.count !== undefined && item.count > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-medium ${item.accent === "amber" ? "bg-amber-500/20 text-amber-400" : "bg-[oklch(0.24_0.01_260)] text-[oklch(0.7_0.01_260)]"}`}>
                    {item.count}
                  </span>
                )}
              </Link>
            )
          })}

          <div className="pt-2">
            <div className="mb-1 px-2 text-[11px] uppercase tracking-wide text-[oklch(0.55_0.01_260)]">Nhóm</div>
            <div className="space-y-0.5">
              {emailGroups.map((group) => (
                <Link key={group.id} to="/mail/groups/$groupId" params={{ groupId: String(group.id) }} className="flex items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-[oklch(0.22_0.01_260)]">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: group.color }} />
                  <span className="truncate flex-1">{group.name}</span>
                </Link>
              ))}
              <button onClick={onCreateGroup} className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm text-[oklch(0.78_0.01_260)] hover:bg-[oklch(0.22_0.01_260)]">
                + Tạo nhóm mới
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Account
