import { useCallback, useEffect, useMemo, useState } from "react";
import { Edit, LockKeyhole, Plus, RefreshCcw, Search, Trash2 } from "lucide-react";
import Button from "@mui/material/Button";
import { Box, Dialog, DialogActions, DialogContent, DialogTitle, Divider, FormControlLabel, FormGroup, Stack, Switch, TextField } from "@mui/material";

import type { Admin, CreateAdminRequest, UpdateAdminRequest } from "../../api/adminApi";
import { changePassword, createAdmin, deleteAdmin, getAdmin, updateAdmin } from "../../api/adminApi";
import StatusBadge from "../ui/StatusBadge";
import CreateAdminDialog from "../ui/CreateAdminDialog";
import ConfirmDialog from "../ui/ConfirmDialog";
import Alert from "../ui/Alert";

const defaultPermissions = {
  log: false,
  data: false,
  sale: false,
  management: false,
};

type AlertState = {
  open: boolean;
  type: "success" | "error" | "warning" | "info";
  message: string;
};

type EditMode = "profile" | "password";

type AdminFormState = {
  email: string;
  full_name: string;
  password: string;
  confirmPassword: string;
  permissions: Record<string, boolean>;
  is_active: boolean;
  is_verified: boolean;
};

export default function AdministratorPage() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [alert, setAlert] = useState<AlertState>({ open: false, type: "info", message: "" });
  const [isOpenCreate, setIsOpenCreate] = useState(false);
  const [isOpenEdit, setIsOpenEdit] = useState(false);
  const [editMode, setEditMode] = useState<EditMode>("profile");
  const [deleteTarget, setDeleteTarget] = useState<Admin | null>(null);
  const [editingAdminId, setEditingAdminId] = useState<number | null>(null);
  const [form, setForm] = useState<AdminFormState>({
    email: "",
    full_name: "",
    password: "",
    confirmPassword: "",
    permissions: { ...defaultPermissions },
    is_active: true,
    is_verified: false,
  });

  function showAlert(type: AlertState["type"], message: string) {
    setAlert({ open: true, type, message });
  }

  function closeEditDialog() {
    setIsOpenEdit(false);
    setEditMode("profile");
    setEditingAdminId(null);
    setForm({
      email: "",
      full_name: "",
      password: "",
      confirmPassword: "",
      permissions: { ...defaultPermissions },
      is_active: true,
      is_verified: false,
    });
  }

  const loadAdmins = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAdmin();
      setAdmins(data);
      setError("");
    } catch {
      setError("Không thể tải danh sách admin");
      showAlert("error", "Không thể tải danh sách admin");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      window.location.href = "/login";
      return;
    }
    const timer = window.setTimeout(() => {
      void loadAdmins();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadAdmins]);

  const filteredAdmins = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return admins;
    return admins.filter((admin) =>
      [admin.full_name, admin.email, String(admin.id)].some((value) => value.toLowerCase().includes(query)),
    );
  }, [admins, search]);

  function handleEdit(admin: Admin) {
    setIsOpenEdit(true);
    setEditMode("profile");
    setEditingAdminId(admin.id);
    setForm({
      email: admin.email,
      full_name: admin.full_name,
      password: "",
      confirmPassword: "",
      permissions: { ...defaultPermissions, ...admin.permissions },
      is_active: admin.is_active,
      is_verified: admin.is_verified,
    });
  }

  async function handleDelete(adminId: number) {
    try {
      await deleteAdmin(adminId);
      setDeleteTarget(null);
      showAlert("success", "Đã xóa admin thành công");
      await loadAdmins();
    } catch {
      showAlert("error", "Xóa admin thất bại");
    }
  }

  async function handleCreateAdmin(payload: CreateAdminRequest) {
    try {
      await createAdmin(payload);
      showAlert("success", "Đã tạo admin mới");
      setIsOpenCreate(false);
      await loadAdmins();
    } catch {
      showAlert("error", "Tạo admin thất bại");
    }
  }

  async function handleSaveEdit() {
    if (editingAdminId === null) return;

    try {
      if (editMode === "password") {
        if (!form.password.trim()) {
          showAlert("warning", "Vui lòng nhập mật khẩu mới");
          return;
        }
        if (form.password !== form.confirmPassword) {
          showAlert("warning", "Mật khẩu xác nhận không khớp");
          return;
        }
        await changePassword({ admin_id: editingAdminId, password: form.password });
        showAlert("success", "Đã đổi mật khẩu admin");
        closeEditDialog();
        return;
      }

      const payload: UpdateAdminRequest = {
        admin_id: editingAdminId,
        email: form.email,
        full_name: form.full_name,
        permissions: form.permissions,
        is_active: form.is_active,
        is_verified: form.is_verified,
      };
      await updateAdmin(payload);
      showAlert("success", "Đã cập nhật admin");
      closeEditDialog();
      await loadAdmins();
    } catch {
      showAlert("error", "Cập nhật admin thất bại");
    }
  }

  return (
    <main className="p-6 lg:p-8 space-y-6">
      <Alert isOpen={alert.open} type={alert.type} message={alert.message} onClose={() => setAlert((current) => ({ ...current, open: false }))} />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Quản lý admin</h1>
          <p className="text-sm text-gray-500">Chỉ hiển thị và thao tác trên admin có quyền <code>management</code>.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outlined" startIcon={<RefreshCcw className="h-4 w-4" />} onClick={() => void loadAdmins()}>Làm mới</Button>
          <Button variant="contained" startIcon={<Plus className="h-4 w-4" />} onClick={() => setIsOpenCreate(true)}>Thêm admin</Button>
        </div>
      </div>

      <div className="rounded-xl border bg-white p-4 shadow-sm flex items-center gap-3">
        <Search className="h-4 w-4 text-gray-400" />
        <input className="w-full bg-transparent outline-none" placeholder="Tìm theo tên, email hoặc ID" value={search} onChange={(event) => setSearch(event.target.value)} />
      </div>

      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b p-4">
          <div>
            <h2 className="font-semibold">Danh sách admin</h2>
            <p className="text-sm text-gray-500">Hiện có: {filteredAdmins.length} admin</p>
          </div>
          <div className="text-sm text-gray-500">{loading ? "Đang tải..." : error || ""}</div>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Họ tên</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Quyền</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredAdmins.map((admin) => (
              <tr key={admin.id} className="align-top hover:bg-gray-50/60">
                <td className="px-4 py-3 font-medium">{admin.id}</td>
                <td className="px-4 py-3">{admin.full_name}</td>
                <td className="px-4 py-3 text-gray-600">{admin.email}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(admin.permissions || {}).map(([key, value]) => (
                      <span key={key} className={`rounded-full px-2 py-1 text-xs ${value ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"}`}>
                        {key}: {String(value)}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3"><StatusBadge active={admin.is_active} verified={admin.is_verified} /></td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <Button size="small" variant="outlined" startIcon={<Edit className="h-4 w-4" />} onClick={() => handleEdit(admin)}>Sửa</Button>
                    <Button size="small" variant="outlined" startIcon={<LockKeyhole className="h-4 w-4" />} onClick={() => { setEditingAdminId(admin.id); setEditMode("password"); setIsOpenEdit(true); }}>Mật khẩu</Button>
                    <Button size="small" color="error" variant="outlined" startIcon={<Trash2 className="h-4 w-4" />} onClick={() => setDeleteTarget(admin)}>Xóa</Button>
                  </div>
                </td>
              </tr>
            ))}
            {!filteredAdmins.length && (
              <tr>
                <td className="px-4 py-10 text-center text-gray-500" colSpan={6}>Không có admin management nào.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <CreateAdminDialog open={isOpenCreate} onClose={() => setIsOpenCreate(false)} onCreate={handleCreateAdmin} />

      <Dialog open={isOpenEdit} onClose={closeEditDialog} fullWidth maxWidth="sm">
        <DialogTitle>{editMode === "password" ? "Đổi mật khẩu admin" : "Chỉnh sửa admin"}</DialogTitle>
        <DialogContent className="space-y-4 pt-2">
          {editMode === "password" ? (
            <Box className="space-y-4">
              <Stack spacing={2.5}>
                <TextField label="Mật khẩu mới" type="password" fullWidth value={form.password} onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} />
                <TextField label="Xác nhận mật khẩu" type="password" fullWidth value={form.confirmPassword} onChange={(event) => setForm((current) => ({ ...current, confirmPassword: event.target.value }))} />
              </Stack>
            </Box>
          ) : (
            <Box className="space-y-4">
              <Stack spacing={1}>
                <TextField label="Email" fullWidth value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} />
                <TextField label="Họ và tên" fullWidth value={form.full_name} onChange={(event) => setForm((current) => ({ ...current, full_name: event.target.value }))} />
                <FormGroup>
                  {Object.entries(form.permissions).map(([key, value]) => (
                    <FormControlLabel
                      key={key}
                      control={<Switch checked={value} onChange={(event) => setForm((current) => ({ ...current, permissions: { ...current.permissions, [key]: event.target.checked } }))} />}
                      label={key}
                    />
                  ))}
                </FormGroup>
              </Stack>
                <Divider />
              <Stack spacing={1}>
                <FormControlLabel control={<Switch checked={form.is_active} onChange={(event) => setForm((current) => ({ ...current, is_active: event.target.checked }))} />} label="Active" />
                <FormControlLabel control={<Switch checked={form.is_verified} onChange={(event) => setForm((current) => ({ ...current, is_verified: event.target.checked }))} />} label="Verified" />
              </Stack>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={closeEditDialog}>Hủy</Button>
          <Button variant="contained" onClick={() => void handleSaveEdit()}>Lưu</Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Xóa admin"
        message={`Bạn có chắc muốn xóa admin ${deleteTarget?.full_name ?? ""}?`}
        confirmLabel="Xóa"
        danger
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && void handleDelete(deleteTarget.id)}
      />
    </main>
  );
}
