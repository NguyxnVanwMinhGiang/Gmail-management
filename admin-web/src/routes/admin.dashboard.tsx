import { Users, Package, TrendingUp, BookOpen } from 'lucide-react';
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/dashboard")({
  component: Dashboard,
});

const monthlyData = [
  { month: 'T1', val: 48 }, { month: 'T2', val: 58 }, { month: 'T3', val: 52 },
  { month: 'T4', val: 67 }, { month: 'T5', val: 76 }, { month: 'T6', val: 82 },
  { month: 'T7', val: 72 }, { month: 'T8', val: 78 }, { month: 'T9', val: 87 },
  { month: 'T10', val: 93 }, { month: 'T11', val: 85 }, { month: 'T12', val: 100 },
];



function Dashboard() {
  return (
    <main className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <section className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Tổng quan hoạt động hệ thống</p>
      </section>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Tổng lượt truy cập" value="1.000" trend="+12.5%" icon={<TrendingUp className="w-6 h-6 text-blue-500" />} />
        <StatCard title="Người dùng" value="500" trend="+8.2%" icon={<Users className="w-6 h-6 text-green-500" />} />
        <StatCard title="Đơn hàng" value="15" trend="+15" icon={<Package className="w-6 h-6 text-purple-500" />} />
        <StatCard title="Tỷ lệ tăng trưởng" value="23.1%" trend="+23.1%" icon={<BookOpen className="w-6 h-6 text-yellow-500" />} />
      </div>

      {/* Charts Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-lg font-semibold mb-6">Lượng truy cập theo tháng</h2>
          <div className="flex items-end justify-between h-48 gap-2">
            {monthlyData.map((item) => (
              <div key={item.month} className="flex flex-col items-center group w-full">
                <div className="w-full bg-blue-100 rounded-t-sm hover:bg-blue-400 transition-all" style={{ height: `${item.val}%` }}></div>
                <small className="text-xs text-gray-400 mt-2">{item.month}</small>
              </div>
            ))}
          </div>
        </div>

        {/* <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center justify-center">
          <h2 className="text-lg font-semibold w-full mb-4">Mức độ hài lòng</h2>
          <div className="w-32 h-32 rounded-full border-8 border-blue-500 flex items-center justify-center mb-4">
            <span className="text-xl font-bold">85%</span>
          </div>
          <p className="text-sm text-gray-500">Đơn hàng được đánh giá tốt</p>
        </div> */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-lg font-semibold mb-6">Mức độ hài lòng</h2>

          <div className="flex flex-row items-center gap-8">
            {/* Phần biểu đồ (Bên trái) */}
            <div className="flex-1 flex flex-col items-center">
              <div className="relative w-32 h-32 flex items-center justify-center">
                {/* Ví dụ biểu đồ đơn giản hoặc giữ nguyên icon/số liệu của bạn */}
                <div className="text-4xl font-bold text-blue-600">85%</div>
              </div>
              <p className="text-sm text-gray-500 mt-2">Tổng hài lòng</p>
            </div>

            {/* Phần chi tiết (Bên phải) */}
            <div className="flex-1 flex flex-col gap-2">
              {[
                { label: '5 sao', count: 120, percent: '80%' },
                { label: '4 sao', count: 20, percent: '10%' },
                { label: '3 sao', count: 5, percent: '5%' },
                { label: '2 sao', count: 3, percent: '3%' },
                { label: '1 sao', count: 2, percent: '2%' },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3 text-sm">
                  <span className="w-12 font-medium text-gray-700">{item.label}</span>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: item.percent }}
                    />
                  </div>
                  <span className="w-12 text-right text-gray-500">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold">Danh sách người dùng</h2>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4">ID</th>
              <th className="px-6 py-4">Họ và tên</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            <tr className="hover:bg-gray-50">
              <td className="px-6 py-4 font-medium">DH001</td>
              <td className="px-6 py-4">Nguyễn Văn A</td>
              <td className="px-6 py-4 text-gray-500">A@gmail.com</td>
              <td className="px-6 py-4"><span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">Active</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>
  );
};

// Sub-component cho Stat Card
const StatCard = ({ title, value, trend, icon }: any) => (
  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex justify-between items-start">
    <div>
      <p className="text-sm text-gray-500">{title}</p>
      <h2 className="text-2xl font-bold mt-1">{value}</h2>
      <p className="text-xs text-green-600 mt-1 font-medium">{trend} <span className="text-gray-400">vs tháng trước</span></p>
    </div>
    <div className="p-2 bg-gray-50 rounded-lg">{icon}</div>
  </div>
);