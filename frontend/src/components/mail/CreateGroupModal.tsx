import { useEffect, useState } from "react";
import { X } from "lucide-react";

const COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#a855f7", "#14b8a6"];

export default function CreateGroupModal({
  open,
  onClose,
  onSave,
  initialName = "",
  initialColor = COLORS[0],
  initialDescription = "",
  title = "Tạo nhóm mới",
}: {
  open: boolean;
  onClose: () => void;
  onSave: (payload: { name: string; color: string; description?: string }) => Promise<void> | void;
  initialName?: string;
  initialColor?: string;
  initialDescription?: string;
  title?: string;
}) {
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [color, setColor] = useState(initialColor);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setName(initialName);
      setDescription(initialDescription);
      setColor(initialColor);
      setError(null);
    }
  }, [open, initialName, initialColor, initialDescription]);

  if (!open) return null;

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError("Vui lòng nhập tên nhóm");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await onSave({ name: name.trim(), description: description.trim() || undefined, color });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể lưu nhóm");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-2xl border border-[oklch(0.24_0.01_260)] bg-[oklch(0.14_0.01_260)] p-4 text-white shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold">{title}</h3>
          <button onClick={onClose} className="rounded p-1 hover:bg-white/10"><X className="h-4 w-4" /></button>
        </div>

        <div className="space-y-3">
          <label className="block text-sm">
            <span className="mb-1 block text-[oklch(0.7_0.01_260)]">Tên nhóm</span>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-lg border border-[oklch(0.24_0.01_260)] bg-[oklch(0.12_0.01_260)] px-3 py-2 text-sm outline-none focus:border-blue-400" placeholder="Ví dụ: Công việc" />
          </label>

          <label className="block text-sm">
            <span className="mb-1 block text-[oklch(0.7_0.01_260)]">Mô tả</span>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="min-h-20 w-full rounded-lg border border-[oklch(0.24_0.01_260)] bg-[oklch(0.12_0.01_260)] px-3 py-2 text-sm outline-none focus:border-blue-400" placeholder="Ví dụ: Email công việc, khách hàng..." />
          </label>

          <div>
            <span className="mb-2 block text-sm text-[oklch(0.7_0.01_260)]">Chọn màu</span>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((item) => (
                <button key={item} onClick={() => setColor(item)} className={`h-8 w-8 rounded-full border-2 ${color === item ? "border-white" : "border-transparent"}`} style={{ backgroundColor: item }} />
              ))}
            </div>
          </div>

          {error && <div className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</div>}

          <div className="flex justify-end gap-2 pt-2">
            <button onClick={onClose} className="rounded-lg border border-[oklch(0.24_0.01_260)] px-4 py-2 text-sm hover:bg-white/5">Hủy</button>
            <button onClick={handleSubmit} disabled={loading} className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 disabled:opacity-60">
              {loading ? "Đang lưu..." : "Lưu"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
