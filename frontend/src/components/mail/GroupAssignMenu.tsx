import { Check, ChevronDown, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import type { EmailGroup } from "../../api/emailGroups";

export default function GroupAssignMenu({
  groups,
  activeGroupIds,
  onToggle,
  onCreateGroup,
}: {
  groups: EmailGroup[];
  activeGroupIds: number[];
  onToggle: (groupId: number) => void;
  onCreateGroup: () => void;
}) {
  const [open, setOpen] = useState(false);
  const activeSet = useMemo(() => new Set(activeGroupIds), [activeGroupIds]);

  return (
    <div className="relative">
      <button onClick={() => setOpen((value) => !value)} className="inline-flex items-center gap-1 rounded-md border border-[oklch(0.24_0.01_260)] px-2 py-1 text-xs text-[oklch(0.85_0.01_260)] hover:bg-white/5">
        <Plus className="h-3.5 w-3.5" /> Thêm vào nhóm <ChevronDown className="h-3.5 w-3.5" />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-30 mt-2 w-64 rounded-xl border border-[oklch(0.24_0.01_260)] bg-[oklch(0.13_0.01_260)] p-2 shadow-xl">
          <div className="mb-1 px-2 text-[11px] uppercase tracking-wide text-[oklch(0.55_0.01_260)]">Nhóm email</div>
          {groups.length === 0 ? (
            <div className="px-2 py-2 text-xs text-[oklch(0.6_0.01_260)]">Chưa có nhóm nào</div>
          ) : (
            groups.map((group) => {
              const checked = activeSet.has(group.id);
              return (
                <button key={group.id} onClick={() => onToggle(group.id)} className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-white/5">
                  <span className="flex h-4 w-4 items-center justify-center rounded border border-[oklch(0.35_0.01_260)] text-[10px]">
                    {checked ? <Check className="h-3 w-3" /> : null}
                  </span>
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: group.color }} />
                  <span className="truncate flex-1">{group.name}</span>
                </button>
              );
            })
          )}

          <button onClick={onCreateGroup} className="mt-1 flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-[oklch(0.78_0.01_260)] hover:bg-white/5">
            <Plus className="h-4 w-4" /> + Tạo nhóm mới
          </button>
        </div>
      )}
    </div>
  );
}
