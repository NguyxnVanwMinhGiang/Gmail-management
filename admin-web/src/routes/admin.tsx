import { createFileRoute, Outlet, Link, redirect, useNavigate } from "@tanstack/react-router";
import { Shield, Users, LogOut, Home, ShieldCog, ShoppingCart } from "lucide-react";
import Button from "@mui/material/Button";

export const Route = createFileRoute("/admin")({
  beforeLoad: () => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      throw redirect({
        to: "/login",
      });
    }
  },
  component: AdminLayout,
});

function AdminLayout() {
  const navigate = useNavigate();

  const logOut = () => {
    localStorage.removeItem('accessToken');
    // Sử dụng navigate của TanStack Router thay vì window.location.href để tránh reload page
    navigate({ to: '/login' });
  };

  const nav = [
    { to: "/admin/administrator", label: "administrator", icon: ShieldCog },
    { to: "/admin/dashboard", label: "Dashboard", icon: Users },
    { to: "/admin/user", label: "User", icon: Users },
    { to: "/admin/google-user", label: "Google User", icon: Users },
    { to: "/admin/order", label: "Order", icon: ShoppingCart },
  ];

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed left-0 top-0 hidden h-screen w-60 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground lg:flex">
        <div className="flex items-center gap-2 px-6 py-5 border-b border-sidebar-border">
          <Shield className="h-5 w-5" />
          <span className="font-display text-lg font-semibold">Steel Admin</span>
        </div>
        
        <nav className="flex-1 px-3 py-4 space-y-1">
          {nav.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              // Các class mặc định luôn hiển thị (layout, spacing, transition)
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm transition"
              // Các class chỉ áp dụng khi đường dẫn đang active
              activeProps={{
                className: "bg-sidebar-accent text-sidebar-accent-foreground font-medium",
              }}
              // Các class chỉ áp dụng khi đường dẫn không active
              inactiveProps={{
                className: "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
              }}
            >
              <Icon className="h-4 w-4" /> {label}
            </Link>
          ))}
        </nav>

        <div className="border-t border-sidebar-border p-3 space-y-1">
          <Link
            to="/"
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent/50"
          >
            <Home className="h-4 w-4" /> Về trang chủ
          </Link>
          <div className="px-3 py-2 text-xs text-sidebar-foreground/50 truncate">
            admin@example.com
          </div>
          <Button
            className="w-full justify-start text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
            onClick={logOut}
          >
            <LogOut className="h-4 w-4 mr-2" /> Đăng xuất
          </Button>
        </div>
      </aside>

      <main className="lg:pl-60">
        <Outlet />
      </main>
    </div>
  );
}
