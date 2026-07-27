import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Shield } from "lucide-react";
import { useState } from "react";
import Button from '@mui/material/Button';

import { loginWithEmail } from "../api/auth";


export const Route = createFileRoute("/login")({
  component: LoginPage,
});


function LoginPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    try {
      await loginWithEmail(email, password);
      
      navigate({ to: "/admin/administrator" });
    } catch (error) {
      console.error("Login failed:", error);
      setError("Email hoặc mật khẩu không đúng.");
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      <div className="hidden lg:flex flex-col justify-between bg-sidebar text-sidebar-foreground p-12">
        <Link to="/" className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          <span className="font-display text-lg font-semibold">Steel Admin</span>
        </Link>
        <div>
          <h2 className="font-display text-3xl font-bold leading-tight">
            "Một console gọn, nhanh, đủ quyền cho team vận hành."
          </h2>
          <p className="mt-4 text-sm text-sidebar-foreground/70">
            Quản lý người dùng, phân quyền, và Gmail — không phức tạp.
          </p>
        </div>
        <span className="text-xs text-sidebar-foreground/50">© Steel Admin</span>
      </div>

      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <h1 className="font-display text-2xl font-bold">
            Đăng nhập
          </h1>
          <h4 className="mt-1 text-sm text-muted-foreground">
            Chào mừng quay lại làm việc.
          </h4>
          <div className="mt-2 mb-4 flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border" />
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <h4 className="font-display text-14px font-bold">Email</h4>
              <input id="email" name="email" type="email" required
                className="flex h-11 w-full rounded-md border border-input bg-transparent px-3 py-2 text-base focus-visible:outline-none"
              />
            </div>
            <div>
              <h4 className="font-display text-14px font-bold">Mật khẩu</h4>
              <input id="password" name="password" type="password" required minLength={6}
                className="flex h-11 w-full rounded-md border border-input bg-transparent px-3 py-2 text-base focus-visible:outline-none"
              />
            </div >
            <div>
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                  <strong className="font-bold">{error}</strong>
                </div>
              )}
            </div>
            <Button className="w-full" type="submit" variant="contained" sx={{ backgroundColor: 'var(--primary)' }}
            >
              Đăng nhập
            </Button>
          </form>

          <p className="mt-6 text-sm text-muted-foreground text-center">
            Chưa có tài khoản ?
            <a className="text-foreground font-medium hover:underline">
              Liên hệ nhân sự
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
