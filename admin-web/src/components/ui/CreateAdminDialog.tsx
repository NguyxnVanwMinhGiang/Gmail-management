import { useState } from "react";
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

interface CreateAdminDialogProps {
    open: boolean;
    onClose: () => void;
}

export default function CreateAdminDialog({
    open,
    onClose,
}: CreateAdminDialogProps) {
    const [permissions, setPermissions] = useState({
        log: true,
        data: true,
        sale: true,
        management: true,
    });

    const handlePermissionChange = (key: keyof typeof permissions) => {
        setPermissions((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    const handleSave = () => {
        const payload = {
            role: "admin",
            permissions,
        };

        console.log(payload);

        // Sau này gọi API ở đây
        // await createAdmin(payload)

        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle sx={{ fontWeight: "bold" }}>
                Thêm Admin mới
            </DialogTitle>

            <DialogContent>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
                    <TextField label="Họ và tên" fullWidth />

                    <TextField label="Email" type="email" fullWidth />

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

                    <TextField label="Password" type="password" fullWidth />
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