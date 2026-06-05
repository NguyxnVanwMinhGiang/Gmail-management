import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Users, ShieldOff, Search, Edit, LockKeyhole, RefreshCcw } from "lucide-react";
import Button from "@mui/material/Button";
import { Box, Dialog, DialogActions, DialogContent, DialogTitle, Divider, FormControlLabel, FormGroup, Switch, TextField, Typography } from "@mui/material";
import type { Admin, CreateAdminRequest } from "../api/adminApi";
import { getAdmin, createAdmin, updateAdmin, deleteAdmin, changePassword } from "../api/adminApi";
import StatusBadge from "../components/ui/StatusBadge";
import CreateAdminDialog from "../components/ui/CreateAdminDialog";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import Alert from "../components/ui/Alert";

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


export const Route = createFileRoute("/admin/administrator")({
  component: Administrator,
});

function Administrator() {
  const navigate = useNavigate();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<AlertState>({
    open: false,
    type: "info",
    message: "",
  });

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

  async function loadAdmins() {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");
      if (!token) {
        navigate({ to: "/login" });
        return;
      }
      const data = await getAdmin();
      setAdmins(data);
    } catch {
      setError("Can not load admin list");
      showAlert("error", "Không thể tải danh sách admin");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { void loadAdmins(); }, []);


  function handleEdit(admin: Admin) {
    setIsOpenEdit(true);
    setEditMode("profile");
    setEditingAdminId(admin.id);

    setForm({
      email: admin.email,
      full_name: admin.full_name,
      password: "",
      confirmPassword: "",
      permissions: {
        ...defaultPermissions,
        ...admin.permissions,
      },
      is_active: admin.is_active,
      is_verified: admin.is_verified,
    });
  }

  async function handleDelete(admin_id: number) {
    try {
      await deleteAdmin(admin_id);
      setDeleteTarget(null);
      showAlert("success", "Đã xóa admin thành công");
      await loadAdmins();
    } catch {
      setError("Xóa admin thất bại");
      showAlert("error", "Xóa admin thất bại");
    }
  }

  async function handleCreateAdmin(payload: CreateAdminRequest) {
    try {
      await createAdmin(payload);
      showAlert("success", "Đã tạo admin mới");
      await loadAdmins();
      setIsOpenCreate(false);
    } catch {
      setError("Tạo admin thất bại");
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

        await changePassword({
          admin_id: editingAdminId,
          password: form.password,
        });

        showAlert("success", "Đã đổi mật khẩu admin");
        closeEditDialog();
        return;
      }

      await updateAdmin({
        admin_id: editingAdminId,
        email: form.email,
        full_name: form.full_name,
        permissions: form.permissions,
        is_active: form.is_active,
        is_verified: form.is_verified,
      });

      showAlert("success", "Đã cập nhật thông tin admin");
      closeEditDialog();
      await loadAdmins();
    } catch {
      showAlert("error", editMode === "password" ? "Đổi mật khẩu thất bại" : "Cập nhật admin thất bại");
    }
  }

  const editPermissions = Object.entries(form.permissions);

  return (

    <div className="p-8 w-full">
      <Alert
        isOpen={alert.open}
        type={alert.type}
        message={alert.message}
        onClose={() => setAlert((prev) => ({ ...prev, open: false }))}
      />

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
        <CreateAdminDialog
          open={isOpenCreate}
          onClose={() => setIsOpenCreate(false)}
          callApi={handleCreateAdmin}
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
                    {Object.entries(data.permissions ?? {}).filter(([_, v]) => v).map(([k]) => (
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
                    <Button variant="outlined" color="error" size="small" sx={{ textTransform: 'none' }} onClick={() => setDeleteTarget(data)}>
                      <ShieldOff className="h-3 w-3 mr-1" /> Xóa
                    </Button>
                    <Button variant="outlined" color="primary" size="small" sx={{ textTransform: 'none' }} onClick={() => (handleEdit(data))}>
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
        <ConfirmDialog
          open={Boolean(deleteTarget)}
          title="Xác nhận xóa admin"
          message={`Bạn có chắc muốn xóa admin ${deleteTarget?.email ?? "này"} không?`}
          confirmLabel="Xóa"
          cancelLabel="Hủy"
          danger
          onClose={() => setDeleteTarget(null)}
          onConfirm={() => {
            if (deleteTarget) {
              void handleDelete(deleteTarget.id);
            }
          }}
        />

        <Dialog open={isOpenEdit} onClose={closeEditDialog} fullWidth maxWidth="md">
          <DialogTitle sx={{ fontWeight: 700 }}>
            Chỉnh sửa admin {editingAdminId !== null ? `#${editingAdminId}` : ""}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Bật công tắc để chuyển sang layout đổi mật khẩu.
                </Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={editMode === "password"}
                      onChange={(_, checked) => setEditMode(checked ? "password" : "profile")}
                    />
                  }
                  label="Đổi mật khẩu"
                />
              </Box>

              <Divider />

              {editMode === "profile" ? (
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }}>
                  <TextField
                    label="Email"
                    value={form.email}
                    onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                    fullWidth
                  />
                  <TextField
                    label="Họ và tên"
                    value={form.full_name}
                    onChange={(event) => setForm((prev) => ({ ...prev, full_name: event.target.value }))}
                    fullWidth
                  />

                  <Box sx={{ gridColumn: "1 / -1" }}>
                    <Typography sx={{ fontWeight: 600, mb: 1 }}>Quyền</Typography>
                    <FormGroup row>
                      {editPermissions.map(([key, value]) => (
                        <FormControlLabel
                          key={key}
                          control={
                            <Switch
                              checked={value}
                              onChange={() => setForm((prev) => ({
                                ...prev,
                                permissions: {
                                  ...prev.permissions,
                                  [key]: !prev.permissions[key],
                                },
                              }))}
                            />
                          }
                          label={key}
                        />
                      ))}
                    </FormGroup>
                  </Box>

                  <FormControlLabel
                    control={
                      <Switch
                        checked={form.is_active}
                        onChange={(_, checked) => setForm((prev) => ({ ...prev, is_active: checked }))}
                      />
                    }
                    label="Đang hoạt động"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={form.is_verified}
                        onChange={(_, checked) => setForm((prev) => ({ ...prev, is_verified: checked }))}
                      />
                    }
                    label="Đã xác minh"
                  />
                </Box>
              ) : (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "text.secondary" }}>
                    <LockKeyhole className="h-4 w-4" />
                    <Typography variant="body2">Nhập mật khẩu mới cho admin này.</Typography>
                  </Box>
                  <TextField
                    label="Mật khẩu mới"
                    type="password"
                    value={form.password}
                    onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
                    fullWidth
                  />
                  <TextField
                    label="Xác nhận mật khẩu"
                    type="password"
                    value={form.confirmPassword}
                    onChange={(event) => setForm((prev) => ({ ...prev, confirmPassword: event.target.value }))}
                    fullWidth
                  />
                </Box>
              )}
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={closeEditDialog}>Hủy</Button>
            <Button
              variant="contained"
              onClick={() => void handleSaveEdit()}
              startIcon={editMode === "password" ? <RefreshCcw className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
            >
              {editMode === "password" ? "Đổi mật khẩu" : "Lưu thay đổi"}
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  );
}