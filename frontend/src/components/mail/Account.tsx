import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { 
  ChevronDown, 
  ChevronRight, 
  Mail, 
  Inbox, 
  Send,
  AlertOctagon, 
  Trash2, 
  Star,
  Group,
  Users // Thêm icon Users cho các nhóm con
} from 'lucide-react'

// 1. Thêm thuộc tính `children` vào kiểu dữ liệu
type Mailbox = { 
  icon: any; 
  label: string; 
  to?: string; 
  count?: number; 
  active?: boolean; 
  accent?: "blue" | "amber";
  children?: Mailbox[]; // Array chứa các menu con bên trong
};

// 2. Thêm dữ liệu children vào mục "Nhóm"
const account1: Mailbox[] = [
  { icon: Inbox, label: "Hộp thư", count: 1041, to: "/mail/inbox" },
  { icon: Send, label: "Thư đã gửi", to: "/mail/sent" },
  { icon: AlertOctagon, label: "Thư rác", count: 3, to: "/mail/spam"},
  { icon: Trash2, label: "Thùng rác", to: "/mail/trash" },
  { icon: Star, label: "Quan trọng", to: "/mail/important", accent: "amber" },
  { 
    icon: Group, 
    label: "Nhóm", 
    // Các nhóm con sẽ nằm ở đây
    children: [
      { icon: Users, label: "Nhóm Công việc", to: "/mail/groups/work" },
      { icon: Users, label: "Nhóm Gia đình", to: "/mail/groups/family", count: 2 }
    ]
  },
];

// 3. Tạo Component NavItem để xử lý render đệ quy và quản lý state đóng/mở
function NavItem({ item }: { item: Mailbox }) {
  const [open, setOpen] = useState(false);
  const Icon = item.icon;
  const accentColor =
    item.accent === "blue" ? "text-[oklch(0.65_0.18_255)]" :
    item.accent === "amber" ? "text-amber-400" : "";

  // Nếu item có children -> Trở thành một Group có thể đóng mở
  if (item.children && item.children.length > 0) {
    return (
      <div className="flex flex-col">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-[oklch(0.22_0.01_260)] text-sm cursor-pointer w-full text-left"
        >
          {/* Đổi vị trí Chevron theo ý muốn, ở đây để phía trước Icon */}
          {open ? <ChevronDown className="w-3.5 h-3.5 text-[oklch(0.5_0.01_260)]" /> : <ChevronRight className="w-3.5 h-3.5 text-[oklch(0.5_0.01_260)]" />}
          <Icon className={`w-4 h-4 ${accentColor || "text-[oklch(0.7_0.01_260)]"}`} />
          <span className={`truncate flex-1 ${accentColor}`}>{item.label}</span>
        </button>
        
        {/* Render danh sách con khi mở */}
        {open && (
          <div className="ml-5 mt-0.5 border-l border-[oklch(0.2_0.01_260)] pl-1">
            {item.children.map((child) => (
              <NavItem key={child.label} item={child} />
            ))}
          </div>
        )}
      </div>
    );
  }

  // Nếu không có children -> Là một Link bình thường
  return (
    <Link
      to={item.to}
      className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer text-sm ${
        item.active ? "bg-[oklch(0.25_0.05_255)]" : "hover:bg-[oklch(0.22_0.01_260)]"
      }`}
      activeProps={{
        className: "bg-[oklch(0.25_0.05_255)] text-white"
      }}
      activeOptions={{ exact: true }}
    >
      <Icon className={`w-4 h-4 ${accentColor || "text-[oklch(0.7_0.01_260)]"}`} />
      <span className={`truncate flex-1 ${accentColor}`}>{item.label}</span>
      {item.count !== undefined && (
        <span className={`text-[11px] px-1.5 py-0.5 rounded-full ${
          item.accent === "blue" ? "bg-[oklch(0.55_0.18_255)] text-white" :
          item.accent === "amber" ? "bg-amber-500 text-black" :
          "text-[oklch(0.6_0.01_260)]"
        }`}>{item.count}</span>
      )}
    </Link>
  );
}

// 4. Cập nhật lại Account Component để dùng NavItem
function Account({ name, count, items = account1, expanded }: { name: string; count?: number; items?: Mailbox[]; expanded?: boolean }) {
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
          {items.map((it) => (
            <NavItem key={it.label} item={it} />
          ))}
        </div>
      )}
    </div>
  );
}

export default Account;
export { account1 };