import { useState } from 'react'
import { Link } from '@tanstack/react-router'
// Import đầy đủ các icon cần thiết cho mảng account1
import { 
  ChevronDown, 
  ChevronRight, 
  Mail, 
  Inbox, 
  FileEdit, 
  Send, 
  Files, 
  AlertOctagon, 
  Trash2, 
  Star, 
  Folder 
} from 'lucide-react'

// Cập nhật kiểu dữ liệu bổ sung thêm thuộc tính 'to' (đường dẫn định tuyến nếu cần)
type Mailbox = { 
  icon: any; 
  label: string; 
  to?: string; 
  count?: number; 
  active?: boolean; 
  accent?: "blue" | "amber" 
};

// Mảng dữ liệu account1 đã được tích hợp trực tiếp vào file
const account1: Mailbox[] = [
  { icon: Inbox, label: "Hộp thư", count: 1041, to: "/mail/inbox" },
  { icon: FileEdit, label: "Thư nháp", to: "/mail/drafts" },
  { icon: Send, label: "Thư đã gửi", to: "/mail/sent" },
  { icon: Files, label: "Tất cả thư", count: 1138, to: "/mail/all" },
  { icon: AlertOctagon, label: "Thư rác", count: 3, to: "/mail/spam"},
  { icon: Trash2, label: "Thùng rác", to: "/mail/trash" },
  { icon: Star, label: "Có gắn dấu sao", to: "/mail/starred" },
  { icon: Folder, label: "Quan trọng", count: 66, to: "/mail/important", accent: "amber" },
];

function Account({ name, count, items = account1, expanded }: { name: string; count?: number; items?: Mailbox[]; expanded?: boolean }) {
  // Gán giá trị mặc định cho `items` là `account1` để nếu component gọi không truyền prop items, nó sẽ tự dùng account1.
  const [open, setOpen] = useState(!!expanded);

  return (
    <div className="mb-1">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-1.5 px-2 py-1.5 rounded hover:bg-[oklch(0.22_0.01_260)] text-sm font-semibold"
      >
        {open ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
        <Mail className="w-4 h-4 text-[oklch(0.7_0.01_260)]" />
        <span className="truncate flex-1 text-left">{name}</span>
        {count !== undefined && <span className="text-xs text-[oklch(0.6_0.01_260)]">{count}</span>}
      </button>
      
      {open && items && (
        <div className="ml-2 mt-0.5">
          {items.map((it) => {
            const Icon = it.icon;
            const accentColor =
              it.accent === "blue" ? "text-[oklch(0.65_0.18_255)]" :
              it.accent === "amber" ? "text-amber-400" : "";
              
            return (
              <Link
                key={it.label}
                to={it.to}
                className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer text-sm ${
                  it.active ? "bg-[oklch(0.25_0.05_255)]" : "hover:bg-[oklch(0.22_0.01_260)]"
                }`}
                activeProps={{
                  className: "bg-[oklch(0.25_0.05_255)] text-white"
                }}
                activeOptions={{ exact: true }}
              >
                <Icon className={`w-4 h-4 ${accentColor || "text-[oklch(0.7_0.01_260)]"}`} />
                <span className={`truncate flex-1 ${accentColor}`}>{it.label}</span>
                {it.count !== undefined && (
                  <span className={`text-[11px] px-1.5 py-0.5 rounded-full ${
                    it.accent === "blue" ? "bg-[oklch(0.55_0.18_255)] text-white" :
                    it.accent === "amber" ? "bg-amber-500 text-black" :
                    "text-[oklch(0.6_0.01_260)]"
                  }`}>{it.count}</span>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Account;
export { account1 }; // Export thêm mảng này ra ngoài nếu các file khác vẫn cần gọi dùng riêng lẻ