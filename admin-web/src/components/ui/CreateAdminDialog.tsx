import { useState } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, FormGroup, Stack, Switch, TextField } from "@mui/material";
import type { CreateAdminRequest } from "../../api/adminApi";

const initialPermissions = {
  log: false,
  data: false,
  sale: false,
  management: false,
};

interface CreateAdminDialogProps {
  open: boolean;
  onClose: () => void;
  onCreate: (payload: CreateAdminRequest) => Promise<void> | void;
}

export default function CreateAdminDialog({ open, onClose, onCreate }: CreateAdminDialogProps) {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [permissions, setPermissions] = useState<Record<string, boolean>>(initialPermissions);
  const [error, setError] = useState("");

  function resetForm() {
    setEmail("");
    setFullName("");
    setPassword("");
    setConfirmPassword("");
    setPermissions(initialPermissions);
    setError("");
  }

  async function handleCreate() {
    if (!email || !fullName || !password) {
      setError("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }

    await onCreate({
      email,
      full_name: fullName,
      password,
      permissions,
    });

    resetForm();
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Tạo admin mới</DialogTitle>
      <DialogContent className="space-y-4 pt-2 ">
        <Stack spacing={2}>
          <TextField label="Email" type="email" fullWidth value={email} onChange={(e) => setEmail(e.target.value)} />
          <TextField label="Họ và tên" fullWidth value={fullName} onChange={(e) => setFullName(e.target.value)} />
          <TextField label="Mật khẩu" type="password" fullWidth value={password} onChange={(e) => setPassword(e.target.value)} />
        
          <TextField
            label="Xác nhận mật khẩu"
            type="password"
            fullWidth
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={Boolean(error)}
            helperText={error}
          />
          <FormGroup>
            {Object.entries(permissions).map(([key, value]) => (
              <FormControlLabel
                key={key}
                control={
                  <Switch
                    checked={value}
                    onChange={(event) => setPermissions((current) => ({ ...current, [key]: event.target.checked }))}
                  />
                }
                label={key}
              />
            ))}
          </FormGroup>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={() => { resetForm(); onClose(); }}>Hủy</Button>
        <Button variant="contained" onClick={() => void handleCreate()}>Tạo admin</Button>
      </DialogActions>
    </Dialog>
  );
}
