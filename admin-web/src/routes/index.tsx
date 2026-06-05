import { createFileRoute, Link } from "@tanstack/react-router";
import { Shield, Users, Mail, ArrowRight } from "lucide-react";


export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <span className="font-display text-lg font-semibold">Steel Admin</span>
          </div>
          <nav className="flex items-center gap-4 text-sm">
            <Link to="/login" className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90">
              Sign in
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-24">
        <div className="max-w-2xl">
          <span className="inline-block rounded-full border border-border px-3 py-1 text-xs uppercase tracking-wider text-muted-foreground">
            Enterprise console
          </span>
          <h1 className="mt-6 text-5xl font-bold leading-tight">
            Quản lý người dùng và email trên một bảng điều khiển.
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Đăng nhập, phân quyền admin/user, và gửi email từ Gmail của bạn — tất cả trong một giao diện gọn gàng theo phong cách Slate &amp; Steel.
          </p>
          <div className="mt-8 flex gap-3">
            <Link to="/login"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Đăng nhập <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="mt-20 grid gap-6 sm:grid-cols-3">
          {[
            { icon: Users, title: "Quản lý user", desc: "Xem, đổi role, xóa tài khoản." },
            { icon: Shield, title: "Phân quyền", desc: "Admin / User với RLS bảo vệ dữ liệu." },
            { icon: Mail, title: "Gmail tích hợp", desc: "Gửi mail từ Gmail của bạn." },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-lg border border-border bg-card p-6">
              <Icon className="h-5 w-5 text-primary" />
              <h3 className="mt-4 font-display text-lg font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
