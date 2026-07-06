import { ChevronDown, ChevronRight, Plus } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import type { EmailGroup } from "../../api/emailGroups";

export default function GroupSidebar({ groups, onCreate }: { groups: EmailGroup[]; onCreate: () => void }) {
  const [open, setOpen] = useState(true);
  const sortedGroups = useMemo(() => groups ?? [], [groups]);

  return (
    <div className="mt-2 rounded-xl border border-[oklch(0.24_0.01_260)] bg-[oklch(0.13_0.01_260)] p-2">
      <button onClick={() => setOpen((value) => !value)} className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-left text-sm font-semibold hover:bg-white/5">
        <span className="flex items-center gap-2">📂 Nhóm</span>
        {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </button>

      {open && (
        <div className="mt-1 space-y-1">
          {sortedGroups.map((group) => (
            <Link key={group.id} to="/mail/groups/$groupId" params={{ groupId: String(group.id) }} className="flex items-center justify-between rounded-lg px-2 py-1.5 text-sm hover:bg-white/5">
              <span className="flex items-center gap-2 truncate"><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: group.color }} />{group.name}</span>
            </Link>
          ))}

          <button onClick={onCreate} className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-[oklch(0.78_0.01_260)] hover:bg-white/5">
            <Plus className="h-4 w-4" /> + Tạo nhóm
          </button>
        </div>
      )}
    </div>
  );
}
