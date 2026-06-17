// import { createFileRoute } from "@tanstack/react-router";
// import { useState } from "react";
// import { useQuery } from "@tanstack/react-query";

// import {
//   Files, Trash2, Star,
//   Search, Reply, ReplyAll, Forward, Archive, Tag, Paperclip
// } from "lucide-react";

// export const Route = createFileRoute("/mail/inbox")({
//   head: () => ({
//     meta: [
//       { title: "Thunderbird Clone — Hộp thư" },
//       { name: "description", content: "Giao diện tĩnh hộp thư lấy cảm hứng từ Mozilla Thunderbird." },
//     ],
//   }),
//   component: Index,
// });

// type EmailItem = {
//   id?: number | string;
//   email_from?: string | null;
//   subject?: string | null;
//   snippet?: string | null;
//   sent_at?: string | null;
//   is_read?: boolean;
//   is_starred?: boolean;
//   body_html?: string | null;
// };



// function Index() {
//   const [selected, setSelected] = useState(0);

//   const { data: emails = [], isLoading: loading, error } = useQuery<EmailItem[]>({
//     queryKey: ["inbox", 1, 20],
//     queryFn: () => getInbox(1, 20),
//     staleTime: 1000 * 60,
//     retry: 1,
//   });

//   const mail = (emails as EmailItem[])[selected] ?? null;

//   return (
//     // Thay đổi ở đây: div bọc ngoài chỉ chịu trách nhiệm flex-col và chiếm full chiều cao/rộng của thẻ cha (main)
//     <div className="flex flex-col flex-1 h-full min-w-0">
//       {/* Title bar */}
//       <div className="flex items-center justify-between h-9 px-2 shrink-0 border-b border-[oklch(0.24_0.01_260)] bg-[oklch(0.14_0.01_260)] select-none">
//         <div className="flex-1 max-w-2xl mx-auto flex items-center gap-2 h-7 px-3 rounded-md bg-[oklch(0.22_0.01_260)] border border-[oklch(0.28_0.01_260)] text-xs text-[oklch(0.65_0.01_260)]">
//           <Search className="w-3.5 h-3.5" />
//           <span>Tìm kiếm…</span>
//           <span className="ml-auto flex items-center gap-1">
//             <kbd className="px-1.5 py-0.5 rounded bg-[oklch(0.28_0.01_260)] text-[10px] border border-[oklch(0.34_0.01_260)]">CTRL</kbd>
//             <span>+</span>
//             <kbd className="px-1.5 py-0.5 rounded bg-[oklch(0.28_0.01_260)] text-[10px] border border-[oklch(0.34_0.01_260)]">K</kbd>
//           </span>
//         </div>

//       </div>

//       {/* Nội dung chính của hòm thư */}
//       <div className="flex flex-1 min-h-0 container-mail-body">
//         <div className="flex-1 flex flex-col min-w-0">
//           {/* Mail list + reading pane */}
//           <div className="flex-1 flex min-h-0">
//             {/* Danh sách Email (Thay đổi từ w-105 sang w-80 hoặc w-96 để cân đối hơn) */}
//             <section className="shrink-0 w-96 border-r border-[oklch(0.24_0.01_260)] overflow-y-auto bg-[oklch(0.17_0.01_260)]">
//               <div className="px-4 py-2.5 text-[11px] uppercase tracking-wider text-[oklch(0.6_0.01_260)] border-b border-[oklch(0.24_0.01_260)] sticky top-0 bg-[oklch(0.17_0.01_260)] z-10">
//                 Hộp thư · {emails.length} thư
//               </div>
//               {loading && <div className="p-4 text-sm">Đang tải...</div>}
//               {error && <div className="p-4 text-sm text-rose-400">{String(error)}</div>}
//               {emails.map((m, i) => {
//                 const from = ((m.email_from || "").split("<")[0] || "").trim() || "(Không có)";
//                 const time = m.sent_at ? new Date(m.sent_at).toLocaleString() : "";
//                 return (
//                   <button
//                     key={i}
//                     onClick={() => setSelected(i)}
//                     className={`block w-[calc(100%-8px)] mx-1 my-1 text-left px-4 py-3 border rounded border-white/20 transition-colors ${selected === i ? "bg-[oklch(0.28_0.06_255)]" : "hover:bg-[oklch(0.21_0.01_260)]"
//                       }`}
//                   >
//                     <div className="flex items-center justify-between gap-2 mb-1">
//                       <span className={`truncate ${!m.is_read ? "font-semibold text-white" : "text-[oklch(0.85_0.01_260)]"}`}>{from}</span>
//                       <span className="shrink-0 flex items-center gap-1.5 text-[11px] text-[oklch(0.6_0.01_260)]">
//                         {false && <Paperclip className="w-3 h-3" />}
//                         {m.is_starred && <Star className="w-3 h-3 fill-amber-400 text-amber-400" />}
//                         {time}
//                       </span>
//                     </div>
//                     <div className={`truncate text-[13px] mb-0.5 ${!m.is_read ? "text-white font-medium" : "text-[oklch(0.78_0.01_260)]"}`}>
//                       {m.subject}
//                     </div>
//                     <div className="truncate text-xs text-[oklch(0.58_0.01_260)]">{m.snippet}</div>
//                   </button>
//                 );
//               })}
//             </section>

//             {/* Khung xem chi tiết thư */}
//             <section className="flex-1 overflow-y-auto">
//               <div className="px-8 py-6 border-b border-[oklch(0.24_0.01_260)]">
//                 <h1 className="text-2xl font-semibold text-white mb-3">{mail?.subject ?? "(Không có tiêu đề)"}</h1>
//                 <div className="flex items-center gap-3">
//                   <div className="w-10 h-10 rounded-full bg-[oklch(0.5_0.15_255)] flex items-center justify-center text-white font-semibold shrink-0">
//                     {((mail?.email_from || "").split("<")[0].trim() || "?").charAt(0)}
//                   </div>
//                   <div className="flex-1 min-w-0">
//                     <div className="flex items-center gap-2">
//                       <span className="font-medium text-white">{(mail?.email_from || "").split("<")[0].trim() || "(Không có)"}</span>
//                       <span className="text-xs text-[oklch(0.6_0.01_260)] truncate">{(mail?.email_from || "").includes("<") ? (mail?.email_from || "") : ""}</span>
//                     </div>
//                     <div className="text-xs text-[oklch(0.6_0.01_260)]">
//                       tới <span className="text-[oklch(0.8_0.01_260)]">tôi</span> · {mail?.sent_at ? new Date(mail.sent_at).toLocaleString() : ""}
//                     </div>
//                   </div>
//                   <div className="flex items-center gap-1 shrink-0">
//                     <IconBtn icon={Reply} onClick={() => console.log("Đã bấm nút Reply!")} />
//                     <IconBtn icon={ReplyAll} onClick={() => console.log("Đã bấm nút ReplyAll!")} />
//                     <IconBtn icon={Forward} onClick={() => console.log("Đã bấm nút Forward!")} />
//                     <IconBtn icon={Archive} onClick={() => console.log("Đã bấm nút Archive!")} />
//                     <IconBtn icon={Tag} onClick={() => console.log("Đã bấm nút Tag!")} />
//                     <IconBtn icon={Trash2} onClick={() => console.log("Đã bấm nút Trash2!")} />
//                   </div>
//                 </div>
//               </div>

//               <article className="px-8 py-6 max-w-3xl space-y-4 text-[oklch(0.85_0.01_260)] leading-relaxed">
//                 <p>Xin chào,</p>
//                 <div>
//                   {/* Nếu có body_html, render dưới dạng HTML (xem xét sanitization nếu cần) */}
//                   {mail?.body_html ? (
//                     <div dangerouslySetInnerHTML={{ __html: mail.body_html as string }} />
//                   ) : (
//                     <p>{mail?.snippet ?? "(Không có nội dung)"}</p>
//                   )}
//                 </div>
//                 <p>Giao diện này hiển thị nội dung trả về từ backend (body_html / snippet).</p>
//                 <div className="rounded-lg border border-[oklch(0.28_0.01_260)] bg-[oklch(0.2_0.01_260)] p-4">
//                   <div className="flex items-center gap-2 text-sm font-medium text-white mb-2">
//                     <Paperclip className="w-4 h-4" /> 2 tệp đính kèm
//                   </div>
//                   <div className="grid grid-cols-2 gap-2">
//                     {["bao-cao-q3.pdf", "lich-hop.ics"].map((f) => (
//                       <div key={f} className="flex items-center gap-2 px-3 py-2 rounded border border-[oklch(0.28_0.01_260)] bg-[oklch(0.16_0.01_260)] text-xs">
//                         <Files className="w-4 h-4 text-[oklch(0.6_0.15_255)]" />
//                         <span className="truncate">{f}</span>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//                 <p>Trân trọng,<br />— {(mail?.email_from || "").split("<")[0].trim() || "(Không có)"}</p>
//               </article>
//             </section>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }



// function IconBtn({ icon: Icon, onClick }: { icon: any; onClick?: () => void }) {
//   return (
//     <button onClick={onClick} className="p-1.5 rounded hover:bg-[oklch(0.24_0.01_260)] text-[oklch(0.75_0.01_260)] hover:text-white">
//       <Icon className="w-4 h-4" />
//     </button>
//   );
// }