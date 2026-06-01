import { useEffect, useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Switch,
    FormControlLabel,
    FormGroup,
    Typography,
    Box,
    Divider,
    Button,
} from "@mui/material";
import type { CreateAdminRequest } from "../../api/adminApi";

interface CreateAdminDialogProps {
    open: boolean;
    onClose: () => void;
    callApi: (payload: CreateAdminRequest) => Promise<void>;
}

const defaultPermissions = {
    log: false,
    data: false,
    sale: false,
    management: false,
};

export default function CreateAdminDialog({
    open,
    onClose,
    callApi
}: CreateAdminDialogProps) {
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [permissions, setPermissions] = useState({
        ...defaultPermissions,
    });
    const [error, setError] = useState("");

    const handlePermissionChange = (key: keyof typeof permissions) => {
        setPermissions((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    useEffect(() => {
        if (!open) {
            setFullName("");
            setEmail("");
            setPassword("");
            setConfirmPassword("");
            setPermissions({ ...defaultPermissions });
            setError("");
        }
    }, [open]);

    const handleSave = async () => {
        if (!fullName.trim() || !email.trim() || !password.trim()) {
            setError("Vui lòng nhập đầy đủ họ tên, email và mật khẩu.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Mật khẩu xác nhận không khớp.");
            return;
        }

        setError("");
        await callApi({
            full_name: fullName.trim(),
            email: email.trim(),
            password,
            permissions,
            is_active: true,
            is_verified: false,
        });
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle sx={{ fontWeight: "bold" }}>
                Thêm Admin mới
            </DialogTitle>

            <DialogContent>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
                    <TextField
                        label="Họ và tên"
                        fullWidth
                        value={fullName}
                        onChange={(event) => setFullName(event.target.value)}
                    />

                    <TextField
                        label="Email"
                        type="email"
                        fullWidth
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                    />

                    <TextField
                        label="Role"
                        value="admin"
                        disabled
                        fullWidth
                        helperText="Role mặc định là admin và không thể thay đổi"
                    />

                    <Divider />

                    <Box>
                        <Typography sx={{ fontWeight: "bold", mb: 1 }}>
                            Permissions
                        </Typography>

                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            Bật / tắt quyền cho admin này
                        </Typography>

                        <FormGroup>
                            {Object.entries(permissions).map(([key, value]) => (
                                <FormControlLabel
                                    key={key}
                                    control={
                                        <Switch
                                            checked={value}
                                            onChange={() =>
                                                handlePermissionChange(key as keyof typeof permissions)
                                            }
                                        />
                                    }
                                    label={key}
                                />
                            ))}
                        </FormGroup>
                    </Box>

                    <TextField
                        label="Password"
                        type="password"
                        fullWidth
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                    />
                    <TextField
                        label="Confirm Password"
                        type="password"
                        fullWidth
                        value={confirmPassword}
                        onChange={(event) => setConfirmPassword(event.target.value)}
                        error={Boolean(error)}
                        helperText={error}
                    />
                </Box>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={onClose}>Hủy</Button>

                <Button variant="contained" onClick={handleSave}>
                    Lưu
                </Button>
            </DialogActions>
        </Dialog>
    );
}