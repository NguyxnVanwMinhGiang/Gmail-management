import { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshCcw, Search } from "lucide-react";
import Button from "@mui/material/Button";
import { Switch } from "@mui/material";

import type { UserItem } from "../../api/userApi";
import { getUsers, updateUserStatus } from "../../api/userApi";
import Alert from "../ui/Alert";

interface UserTableRowProps {
    user: UserItem;
    onToggleActive: (user: UserItem) => void;
    onToggleVip: (user: UserItem) => void;
}

function UserTableRow({ user, onToggleActive, onToggleVip }: UserTableRowProps) {
    return (
        <tr className="hover:bg-gray-50/60">
            <td className="px-4 py-3 font-medium">{user.id}</td>
            <td className="px-4 py-3">{user.full_name}</td>
            <td className="px-4 py-3 text-gray-600">{user.email}</td>
            <td className="px-4 py-3">{user.role}</td>
            <td className="px-4 py-3">
                <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-sm">
                        <span className="text-gray-600">Active</span>
                        <Switch size="small" checked={user.is_active} onChange={() => onToggleActive(user)} />
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                        <span className="text-gray-600">VIP</span>
                        <Switch size="small" checked={user.vip} onChange={() => onToggleVip(user)} />
                    </label>
                </div>
            </td>
            <td className="px-4 py-3 text-xs text-gray-400">{user.updated_at ?? "--"}</td>
        </tr>
    );
}

export default function UserPage() {
    const [users, setUsers] = useState<UserItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [alert, setAlert] = useState({ open: false, type: "info" as "success" | "error" | "warning" | "info", message: "" });

    const showAlert = (type: "success" | "error" | "warning" | "info", message: string) => {
        setAlert({ open: true, type, message });
    };

    const loadUsers = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getUsers();
            setUsers(data);
        } catch (error) {
            console.error(error);
            showAlert("error", "Không thể tải danh sách user");
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
            void loadUsers();
        }, 0);

        return () => window.clearTimeout(timer);
    }, [loadUsers]);

    const filteredUsers = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) return users;
        return users.filter((user) =>
            [user.full_name, user.email, String(user.id)].some((value) => value.toLowerCase().includes(query)),
        );
    }, [users, search]);

    const toggleUserStatus = useCallback(
        async (user: UserItem, field: "is_active" | "vip") => {
            try {
                const payload = { [field]: !user[field] };
                const updated = await updateUserStatus(user.id, payload);
                setUsers((current) => current.map((item) => (item.id === updated.id ? updated : item)));
                showAlert("success", "Đã cập nhật người dùng");
            } catch (error) {
                console.error(error);
                showAlert("error", "Cập nhật người dùng thất bại");
            }
        },
        [],
    );

    return (
        <main className="p-6 lg:p-8 space-y-6">
            <Alert isOpen={alert.open} type={alert.type} message={alert.message} onClose={() => setAlert((current) => ({ ...current, open: false }))} />

            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Quản lý user thường</h1>
                    <p className="text-sm text-gray-500">Danh sách user đăng ký bằng email/password.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outlined" startIcon={<RefreshCcw className="h-4 w-4" />} onClick={() => void loadUsers()}>
                        Làm mới
                    </Button>
                </div>
            </div>

            <div className="rounded-xl border bg-white p-4 shadow-sm flex items-center gap-3">
                <Search className="h-4 w-4 text-gray-400" />
                <input
                    className="w-full bg-transparent outline-none"
                    placeholder="Tìm theo tên, email hoặc ID"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                />
            </div>

            <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
                <div className="flex items-center justify-between border-b p-4">
                    <div>
                        <h2 className="font-semibold">Danh sách user thường</h2>
                        <p className="text-sm text-gray-500">{filteredUsers.length} người dùng</p>
                    </div>
                    <div className="text-sm text-gray-500">{loading ? "Đang tải..." : ""}</div>
                </div>
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-gray-600">
                        <tr>
                            <th className="px-4 py-3">ID</th>
                            <th className="px-4 py-3">Họ tên</th>
                            <th className="px-4 py-3">Email</th>
                            <th className="px-4 py-3">Role</th>
                            <th className="px-4 py-3">Trạng thái</th>
                            <th className="px-4 py-3">Cập nhật</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {filteredUsers.map((user) => (
                            <UserTableRow
                                key={user.id}
                                user={user}
                                onToggleActive={(target) => void toggleUserStatus(target, "is_active")}
                                onToggleVip={(target) => void toggleUserStatus(target, "vip")}
                            />
                        ))}
                        {!filteredUsers.length && (
                            <tr>
                                <td className="px-4 py-10 text-center text-gray-500" colSpan={6}>
                                    Không có người dùng nào.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </main>
    );
}
