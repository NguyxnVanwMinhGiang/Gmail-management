import { createFileRoute } from "@tanstack/react-router";
import { Package, TrendingUp, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { getDashboard, type DashboardResponse } from "../api/dashboardApi";

export const Route = createFileRoute("/admin/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      window.location.href = "/login";
      return;
    }

    void (async () => {
      try {
        setLoading(true);
        const response = await getDashboard();
        setData(response);
      } catch (err) {
        console.error(err);
        setError("Không thể tải dữ liệu dashboard");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const maxVisit = useMemo(() => Math.max(...(data?.monthly.visits ?? [0]), 1), [data]);
  const maxOrder = useMemo(() => Math.max(...(data?.monthly.orders ?? [0]), 1), [data]);

  const growth = data?.summary.growth_rate ?? 0;

  return (
    <main className="p-8 bg-gray-50 min-h-screen space-y-8">
      <section>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Tổng quan hoạt động hệ thống</p>
      </section>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Tổng user" value={data?.summary.total_users ?? 0} trend="Tất cả tài khoản" icon={<Users className="w-6 h-6 text-blue-500" />} />
        <StatCard title="Tổng đơn hàng" value={data?.summary.total_orders ?? 0} trend="Tất cả đơn hàng" icon={<Package className="w-6 h-6 text-purple-500" />} />
        <StatCard title="Tỷ lệ tăng trưởng" value={`${growth.toFixed(2)}%`} trend="Đơn hàng tháng này / tháng trước" icon={<TrendingUp className="w-6 h-6 text-green-500" />} />
        <StatCard title="Đơn hàng tháng này" value={data?.summary.current_month_orders ?? 0} trend={`Tháng trước: ${data?.summary.previous_month_orders ?? 0}`} icon={<Package className="w-6 h-6 text-yellow-500" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Lượng người truy cập theo tháng" labels={data?.monthly.labels ?? []} values={data?.monthly.visits ?? []} maxValue={maxVisit} colorClass="bg-blue-500" loading={loading} />
        <ChartCard title="Lượng đơn hàng theo tháng" labels={data?.monthly.labels ?? []} values={data?.monthly.orders ?? []} maxValue={maxOrder} colorClass="bg-purple-500" loading={loading} />
      </div>
    </main>
  );
}

function StatCard({ title, value, trend, icon }: any) {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex justify-between items-start">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <h2 className="text-2xl font-bold mt-1">{value}</h2>
        <p className="text-xs text-green-600 mt-1 font-medium">{trend}</p>
      </div>
      <div className="p-2 bg-gray-50 rounded-lg">{icon}</div>
    </div>
  );
}

function ChartCard({ title, labels, values, maxValue, colorClass, loading }: {
  title: string;
  labels: string[];
  values: number[];
  maxValue: number;
  colorClass: string;
  loading: boolean;
}) {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
      <h2 className="text-lg font-semibold mb-6">{title}</h2>
      <div className="flex items-end justify-between h-56 gap-2">
        {(loading ? Array.from({ length: 12 }) : labels).map((label, index) => {
          const value = values[index] ?? 0;
          const height = loading ? 20 : Math.max((value / maxValue) * 100, 3);
          const labelText = loading ? `T${index + 1}` : String(label);
          return (
            <div key={`${label}-${index}`} className="flex flex-col items-center group w-full h-full justify-end">
              <div className={`w-full rounded-t-sm transition-all ${loading ? 'bg-gray-200 animate-pulse' : colorClass}`} style={{ height: `${height}%` }} />
              <small className="text-xs text-gray-400 mt-2">{labelText}</small>
              {!loading && <small className="text-[11px] text-gray-500 mt-1">{value}</small>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
