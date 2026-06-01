import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Users, ShieldOff, Search, Edit } from "lucide-react";
import Button from "@mui/material/Button";
import type { Admin } from "../api/adminApi";
import { getAdmin } from "../api/adminApi";
import StatusBadge from "../components/ui/StatusBadge";
import CreateAdminDialog from "../components/ui/CreateAdminDialog";


export const Route = createFileRoute("/admin/administrator")({
  component: Administrator,
});

function Administrator() {
  const navigate = useNavigate();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [isOpenCreate, setIsOpenCreate] = useState(false)
  const [isOpenDelete, setIsOpenDelete] = useState(false)
  const [isOpenEdit, setIsOpenEdit] = useState(false)
  async function loadAdmins() {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");
      if (!token) navigate({ to: '/login' });
      const data = await getAdmin();
      setAdmins(data);
    } catch {
      setError("Can not load admin list");
    } finally {
      setLoading(false);
    }
  }

  // async function createAdmin() {
  //   try {
  //     setLoading(true);
  //     const token = localStorage.getItem("accessToken");
  //     if (!token) navigate({ to: '/login' });
  //     const data = await getAdmin();
  //     setAdmins(data);
  //   } catch {
  //     setError("Can not load admin list");
  //   } finally {
  //     setLoading(false);
  //   }
  // }

  useEffect(() => { loadAdmins(); }, []);

  return (

    <div className="p-8 w-full">
      <header className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Users className="h-4 w-4" /> Admin
          </div>
          <h1 className="font-display text-3xl font-bold mt-1">Người dùng</h1>
        </div>
      </header>

      <div className="mb-6 flex gap-4 justify-between">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            className="w-full pl-10 pr-4 py-2 border rounded-md border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Tìm theo email hoặc tên..."
          />
        </div>

        <Button
          variant="contained"
          onClick={() => setIsOpenCreate(true)}
          sx={{ textTransform: 'none' }}
        >
          Thêm Admin
        </Button>
        <CreateAdminDialog open={isOpenCreate}
        onClose={() => setIsOpenCreate(false)}
        />
      </div>


      {/* Container cuộn ngang */}
      <div className="rounded-lg border border-border bg-card shadow-sm overflow-x-auto">
        <table className="w-full text-sm border-separate border-spacing-0">
          <thead className="bg-muted/50 text-muted-foreground">
            <tr>
              <th className="text-left font-medium px-6 py-4 sticky left-0 bg-muted/90 z-20 whitespace-nowrap">Email</th>
              <th className="text-left font-medium px-6 py-4 whitespace-nowrap">Họ và tên</th>
              <th className="text-left font-medium px-6 py-4 whitespace-nowrap">Role</th>
              <th className="text-left font-medium px-6 py-4 whitespace-nowrap">Quyền</th>
              <th className="text-left font-medium px-6 py-4 whitespace-nowrap">ID tạo</th>
              <th className="text-left font-medium px-6 py-4 whitespace-nowrap">ID update</th>
              <th className="text-left font-medium px-6 py-4 whitespace-nowrap">Ngày tạo</th>
              <th className="text-left font-medium px-6 py-4 whitespace-nowrap">Ngày update</th>
              <th className="text-left font-medium px-6 py-4 whitespace-nowrap">Trạng thái</th>
              <th className="text-right font-medium px-6 py-4 sticky right-0 bg-muted/90 z-20 whitespace-nowrap border-l border-border">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr><td colSpan={10} className="px-6 py-4 text-center">Đang tải...</td></tr>
            ) : admins.length > 0 ? (admins.map((data) => (
              <tr key={data.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-6 py-4 sticky left-0 bg-card z-10 border-r whitespace-nowrap">
                  <div className="font-medium">{data.email}</div>
                  <div className="text-xs text-muted-foreground">ID: {data.id}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{data.full_name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">{data.role}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="items-center flex gap-2 whitespace-nowrap">
                    {Object.entries(data.permissions).filter(([_, v]) => v).map(([k]) => (
                      <span key={k} className="bg-primary/10 text-primary px-2 py-0.5 rounded text-[15px] inline-block">{k}</span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{data.created_by || "-"}</td>
                <td className="px-6 py-4 whitespace-nowrap">{data.updated_by || "-"}</td>
                <td className="px-6 py-4 whitespace-nowrap">{new Date(data.created_at).toLocaleDateString("vi-VN")}</td>
                <td className="px-6 py-4 whitespace-nowrap">{new Date(data.updated_at).toLocaleDateString("vi-VN")}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge value={data.is_active} label="Active" />
                  <StatusBadge value={data.is_verified} label="Verified" />
                  <StatusBadge value={data.is_2fa_enabled} label="2FA" />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right sticky right-0 bg-card z-10">
                  <div className="flex gap-2 justify-end">
                    <Button variant="outlined" color="error" size="small" sx={{ textTransform: 'none' }} onClick={() => (setIsOpenDelete(true))}>
                      <ShieldOff className="h-3 w-3 mr-1" /> Xóa
                    </Button>
                    <Button variant="outlined" color="primary" size="small" sx={{ textTransform: 'none' }} onClick={() => (setIsOpenEdit(true))}>
                      <Edit className="h-3 w-3 mr-1" /> Edit
                    </Button>
                  </div>
                </td>
              </tr>
            ))) : (
              <tr><td colSpan={10} className="px-6 py-4 text-center">Không có dữ liệu {error}</td></tr>
            )}
          </tbody>
        </table>
        
        <div>
          {isOpenDelete && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
              <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">Thêm Admin mới</h2>

                {/* Form nhập liệu */}
                <div className="space-y-4">
                  <input className="w-full border p-2 rounded" placeholder="Email" />
                  <input className="w-full border p-2 rounded" placeholder="Họ và tên" />

                  <div className="flex justify-end gap-2 mt-6">
                    <Button onClick={() => setIsOpenDelete(false)}>Hủy</Button>
                    <Button variant="contained" >Lưu</Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div>
          {isOpenEdit && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
              <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">Thêm Admin mới</h2>

                {/* Form nhập liệu */}
                <div className="space-y-4">
                  <input className="w-full border p-2 rounded" placeholder="Email" />
                  <input className="w-full border p-2 rounded" placeholder="Họ và tên" />

                  <div className="flex justify-end gap-2 mt-6">
                    <Button onClick={() => setIsOpenEdit(false)}>Hủy</Button>
                    <Button variant="contained" >Lưu</Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}