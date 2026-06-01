// import { createFileRoute, useNavigate } from "@tanstack/react-router";
// import { useEffect, useState } from "react";
// import {
//   Admin,
//   getAdmins,
//   createAdmin,
//   updateAdmin,
//   deleteAdmin,
// } from "../api/adminApi";

// export const Route = createFileRoute("/admin")({
//   component: AdminPage,
// });

// function AdminPage() {
//   const navigate = useNavigate();

//   const [admins, setAdmins] = useState<Admin[]>([]);
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);

//   const [editingAdminId, setEditingAdminId] = useState<number | null>(null);

//   const [form, setForm] = useState({
//     email: "",
//     password: "",
//     full_name: "",
//     manage_admin: false,
//     manage_user: false,
//     manage_email: false,
//     manage_spam: false,
//     is_active: true,
//     is_verified: false,
//   });

//   async function loadAdmins() {
//     try {
//       setLoading(true);
//       setError("");

//       const token = localStorage.getItem("accessToken");

//       if (!token) {
//         navigate({ to: "/login" });
//         return;
//       }

//       const data = await getAdmins();
//       setAdmins(data);
//     } catch {
//       setError("Không thể tải danh sách admin");
//     } finally {
//       setLoading(false);
//     }
//   }

//   useEffect(() => {
//     loadAdmins();
//   }, []);

//   function resetForm() {
//     setEditingAdminId(null);

//     setForm({
//       email: "",
//       password: "",
//       full_name: "",
//       manage_admin: false,
//       manage_user: false,
//       manage_email: false,
//       manage_spam: false,
//       is_active: true,
//       is_verified: false,
//     });
//   }

//   function handleEdit(admin: Admin) {
//     setEditingAdminId(admin.id);

//     setForm({
//       email: admin.email,
//       password: "",
//       full_name: admin.full_name,
//       manage_admin: admin.permissions?.manage_admin ?? false,
//       manage_user: admin.permissions?.manage_user ?? false,
//       manage_email: admin.permissions?.manage_email ?? false,
//       manage_spam: admin.permissions?.manage_spam ?? false,
//       is_active: admin.is_active,
//       is_verified: admin.is_verified,
//     });
//   }

//   async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
//     event.preventDefault();

//     try {
//       setError("");

//       const permissions = {
//         manage_admin: form.manage_admin,
//         manage_user: form.manage_user,
//         manage_email: form.manage_email,
//         manage_spam: form.manage_spam,
//       };

//       if (editingAdminId) {
//         await updateAdmin(editingAdminId, {
//           full_name: form.full_name,
//           permissions,
//           is_active: form.is_active,
//           is_verified: form.is_verified,
//         });
//       } else {
//         await createAdmin({
//           email: form.email,
//           password: form.password,
//           full_name: form.full_name,
//           permissions,
//           is_active: form.is_active,
//           is_verified: form.is_verified,
//         });
//       }

//       resetForm();
//       await loadAdmins();
//     } catch {
//       setError("Lưu admin thất bại");
//     }
//   }

//   async function handleDelete(adminId: number) {
//     const ok = confirm("Bạn có chắc muốn xóa admin này không?");

//     if (!ok) return;

//     try {
//       await deleteAdmin(adminId);
//       await loadAdmins();
//     } catch {
//       setError("Xóa admin thất bại");
//     }
//   }

//   function logout() {
//     localStorage.removeItem("accessToken");
//     navigate({ to: "/login" });
//   }

//   return (
//     <div className="min-h-screen bg-black text-white p-8">
//       <div className="max-w-7xl mx-auto">
//         <div className="flex items-center justify-between mb-8">
//           <div>
//             <h1 className="text-3xl font-bold">Quản lý Admin</h1>
//             <p className="text-zinc-400 mt-1">
//               Thêm, sửa, xóa và phân quyền admin
//             </p>
//           </div>

//           <button
//             onClick={logout}
//             className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600"
//           >
//             Đăng xuất
//           </button>
//         </div>

//         {error && (
//           <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-400">
//             {error}
//           </div>
//         )}

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           {/* FORM */}
//           <div className="lg:col-span-1 bg-white/5 border border-white/10 rounded-2xl p-6">
//             <h2 className="text-xl font-semibold mb-5">
//               {editingAdminId ? "Cập nhật Admin" : "Thêm Admin"}
//             </h2>

//             <form onSubmit={handleSubmit} className="space-y-4">
//               <div>
//                 <label className="text-sm text-zinc-400">Email</label>
//                 <input
//                   type="email"
//                   disabled={!!editingAdminId}
//                   value={form.email}
//                   onChange={(e) =>
//                     setForm({ ...form, email: e.target.value })
//                   }
//                   className="mt-1 w-full rounded-lg bg-black border border-white/10 px-4 py-3 outline-none disabled:text-zinc-500"
//                   required
//                 />
//               </div>

//               {!editingAdminId && (
//                 <div>
//                   <label className="text-sm text-zinc-400">Mật khẩu</label>
//                   <input
//                     type="password"
//                     value={form.password}
//                     onChange={(e) =>
//                       setForm({ ...form, password: e.target.value })
//                     }
//                     className="mt-1 w-full rounded-lg bg-black border border-white/10 px-4 py-3 outline-none"
//                     required
//                   />
//                 </div>
//               )}

//               <div>
//                 <label className="text-sm text-zinc-400">Họ tên</label>
//                 <input
//                   type="text"
//                   value={form.full_name}
//                   onChange={(e) =>
//                     setForm({ ...form, full_name: e.target.value })
//                   }
//                   className="mt-1 w-full rounded-lg bg-black border border-white/10 px-4 py-3 outline-none"
//                   required
//                 />
//               </div>

//               <div className="space-y-3">
//                 <p className="text-sm text-zinc-400">Quyền</p>

//                 <label className="flex items-center gap-3">
//                   <input
//                     type="checkbox"
//                     checked={form.manage_admin}
//                     onChange={(e) =>
//                       setForm({ ...form, manage_admin: e.target.checked })
//                     }
//                   />
//                   Quản lý admin
//                 </label>

//                 <label className="flex items-center gap-3">
//                   <input
//                     type="checkbox"
//                     checked={form.manage_user}
//                     onChange={(e) =>
//                       setForm({ ...form, manage_user: e.target.checked })
//                     }
//                   />
//                   Quản lý user
//                 </label>

//                 <label className="flex items-center gap-3">
//                   <input
//                     type="checkbox"
//                     checked={form.manage_email}
//                     onChange={(e) =>
//                       setForm({ ...form, manage_email: e.target.checked })
//                     }
//                   />
//                   Quản lý email
//                 </label>

//                 <label className="flex items-center gap-3">
//                   <input
//                     type="checkbox"
//                     checked={form.manage_spam}
//                     onChange={(e) =>
//                       setForm({ ...form, manage_spam: e.target.checked })
//                     }
//                   />
//                   Quản lý spam
//                 </label>
//               </div>

//               <div className="space-y-3">
//                 <label className="flex items-center gap-3">
//                   <input
//                     type="checkbox"
//                     checked={form.is_active}
//                     onChange={(e) =>
//                       setForm({ ...form, is_active: e.target.checked })
//                     }
//                   />
//                   Đang hoạt động
//                 </label>

//                 <label className="flex items-center gap-3">
//                   <input
//                     type="checkbox"
//                     checked={form.is_verified}
//                     onChange={(e) =>
//                       setForm({ ...form, is_verified: e.target.checked })
//                     }
//                   />
//                   Đã xác minh
//                 </label>
//               </div>

//               <div className="flex gap-3">
//                 <button
//                   type="submit"
//                   className="flex-1 rounded-lg bg-white text-black font-semibold py-3 hover:bg-zinc-300"
//                 >
//                   {editingAdminId ? "Cập nhật" : "Tạo mới"}
//                 </button>

//                 {editingAdminId && (
//                   <button
//                     type="button"
//                     onClick={resetForm}
//                     className="rounded-lg border border-white/10 px-4 py-3 hover:bg-white/10"
//                   >
//                     Hủy
//                   </button>
//                 )}
//               </div>
//             </form>
//           </div>

//           {/* TABLE */}
//           <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-6 overflow-x-auto">
//             <h2 className="text-xl font-semibold mb-5">Danh sách Admin</h2>

//             {loading ? (
//               <p className="text-zinc-400">Đang tải...</p>
//             ) : (
//               <table className="w-full text-sm">
//                 <thead>
//                   <tr className="border-b border-white/10 text-zinc-400">
//                     <th className="text-left py-3">ID</th>
//                     <th className="text-left py-3">Email</th>
//                     <th className="text-left py-3">Họ tên</th>
//                     <th className="text-left py-3">Trạng thái</th>
//                     <th className="text-left py-3">Quyền</th>
//                     <th className="text-right py-3">Hành động</th>
//                   </tr>
//                 </thead>

//                 <tbody>
//                   {admins.map((admin) => (
//                     <tr key={admin.id} className="border-b border-white/5">
//                       <td className="py-4">{admin.id}</td>
//                       <td className="py-4">{admin.email}</td>
//                       <td className="py-4">{admin.full_name}</td>
//                       <td className="py-4">
//                         {admin.is_active ? (
//                           <span className="text-green-400">Active</span>
//                         ) : (
//                           <span className="text-red-400">Inactive</span>
//                         )}
//                       </td>
//                       <td className="py-4">
//                         <div className="flex flex-wrap gap-2">
//                           {Object.entries(admin.permissions || {})
//                             .filter(([, value]) => value)
//                             .map(([key]) => (
//                               <span
//                                 key={key}
//                                 className="rounded-full bg-white/10 px-2 py-1 text-xs"
//                               >
//                                 {key}
//                               </span>
//                             ))}
//                         </div>
//                       </td>
//                       <td className="py-4 text-right">
//                         <button
//                           onClick={() => handleEdit(admin)}
//                           className="mr-3 text-blue-400 hover:underline"
//                         >
//                           Sửa
//                         </button>

//                         <button
//                           onClick={() => handleDelete(admin.id)}
//                           className="text-red-400 hover:underline"
//                         >
//                           Xóa
//                         </button>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             )}

//             {!loading && admins.length === 0 && (
//               <p className="text-zinc-400 mt-4">Chưa có admin nào</p>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }