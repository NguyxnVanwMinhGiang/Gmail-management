import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Files, Trash2, Star,
  Search, Reply, ReplyAll, Forward, Archive, Tag, Paperclip
} from "lucide-react";

export const Route = createFileRoute("/mail/inbox")({
  head: () => ({
    meta: [
      { title: "Thunderbird Clone — Hộp thư" },
      { name: "description", content: "Giao diện tĩnh hộp thư lấy cảm hứng từ Mozilla Thunderbird." },
    ],
  }),
  component: Index,
});

const emails = [
  { from: "GitHub", subject: "[lovable-dev/app] PR #482 đã được hợp nhất", preview: "Pull request của bạn đã được merge vào nhánh main…", time: "09:42", unread: true, starred: true, attachment: false },
  { from: "GitHub", subject: "[lovable-dev/app] PR #482 đã được hợp nhất", preview: "Pull request của bạn đã được merge vào nhánh main…", time: "09:42", unread: true, starred: true, attachment: false },
];


function Index() {
  const [selected, setSelected] = useState(0);
  const mail = emails[selected];

  return (
    // Thay đổi ở đây: div bọc ngoài chỉ chịu trách nhiệm flex-col và chiếm full chiều cao/rộng của thẻ cha (main)
    <div className="flex flex-col flex-1 h-full min-w-0">
      {/* Title bar */}
      <div className="flex items-center justify-between h-9 px-2 shrink-0 border-b border-[oklch(0.24_0.01_260)] bg-[oklch(0.14_0.01_260)] select-none">
        <div className="flex-1 max-w-2xl mx-auto flex items-center gap-2 h-7 px-3 rounded-md bg-[oklch(0.22_0.01_260)] border border-[oklch(0.28_0.01_260)] text-xs text-[oklch(0.65_0.01_260)]">
          <Search className="w-3.5 h-3.5" />
          <span>Tìm kiếm…</span>
          <span className="ml-auto flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-[oklch(0.28_0.01_260)] text-[10px] border border-[oklch(0.34_0.01_260)]">CTRL</kbd>
            <span>+</span>
            <kbd className="px-1.5 py-0.5 rounded bg-[oklch(0.28_0.01_260)] text-[10px] border border-[oklch(0.34_0.01_260)]">K</kbd>
          </span>
        </div>

      </div>

      {/* Nội dung chính của hòm thư */}
      <div className="flex flex-1 min-h-0 container-mail-body">
        <div className="flex-1 flex flex-col min-w-0">
          {/* Mail list + reading pane */}
          <div className="flex-1 flex min-h-0">
            {/* Danh sách Email (Thay đổi từ w-105 sang w-80 hoặc w-96 để cân đối hơn) */}
            <section className="shrink-0 w-96 border-r border-[oklch(0.24_0.01_260)] overflow-y-auto bg-[oklch(0.17_0.01_260)]">
              <div className="px-4 py-2.5 text-[11px] uppercase tracking-wider text-[oklch(0.6_0.01_260)] border-b border-[oklch(0.24_0.01_260)] sticky top-0 bg-[oklch(0.17_0.01_260)] z-10">
                Hộp thư · {emails.length} thư
              </div>
              {emails.map((m, i) => (
                <button
                  key={i}
                  onClick={() => setSelected(i)}
                  className={`block w-[calc(100%-8px)] mx-1 my-1 text-left px-4 py-3 border rounded border-white/20 transition-colors ${selected === i ? "bg-[oklch(0.28_0.06_255)]" : "hover:bg-[oklch(0.21_0.01_260)]"
                    }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className={`truncate ${m.unread ? "font-semibold text-white" : "text-[oklch(0.85_0.01_260)]"}`}>{m.from}</span>
                    <span className="shrink-0 flex items-center gap-1.5 text-[11px] text-[oklch(0.6_0.01_260)]">
                      {m.attachment && <Paperclip className="w-3 h-3" />}
                      {m.starred && <Star className="w-3 h-3 fill-amber-400 text-amber-400" />}
                      {m.time}
                    </span>
                  </div>
                  <div className={`truncate text-[13px] mb-0.5 ${m.unread ? "text-white font-medium" : "text-[oklch(0.78_0.01_260)]"}`}>
                    {m.subject}
                  </div>
                  <div className="truncate text-xs text-[oklch(0.58_0.01_260)]">{m.preview}</div>
                </button>
              ))}
            </section>

            {/* Khung xem chi tiết thư */}
            <section className="flex-1 overflow-y-auto">
              <div className="px-8 py-6 border-b border-[oklch(0.24_0.01_260)]">
                <h1 className="text-2xl font-semibold text-white mb-3">{mail.subject}</h1>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[oklch(0.5_0.15_255)] flex items-center justify-center text-white font-semibold shrink-0">
                    {mail.from.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white">{mail.from}</span>
                      <span className="text-xs text-[oklch(0.6_0.01_260)] truncate">&lt;noreply@{mail.from.toLowerCase().replace(/\s/g, "")}.com&gt;</span>
                    </div>
                    <div className="text-xs text-[oklch(0.6_0.01_260)]">
                      tới <span className="text-[oklch(0.8_0.01_260)]">tôi</span> · {mail.time}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <IconBtn icon={Reply} onClick={() => console.log("Đã bấm nút Reply!")} />
                    <IconBtn icon={ReplyAll} onClick={() => console.log("Đã bấm nút ReplyAll!")} />
                    <IconBtn icon={Forward} onClick={() => console.log("Đã bấm nút Forward!")} />
                    <IconBtn icon={Archive} onClick={() => console.log("Đã bấm nút Archive!")} />
                    <IconBtn icon={Tag} onClick={() => console.log("Đã bấm nút Tag!")} />
                    <IconBtn icon={Trash2} onClick={() => console.log("Đã bấm nút Trash2!")} />
                  </div>
                </div>
              </div>

              <article className="px-8 py-6 max-w-3xl space-y-4 text-[oklch(0.85_0.01_260)] leading-relaxed">
                <p>Xin chào,</p>
                <p>{mail.preview} Đây là nội dung mẫu hiển thị trong khung đọc thư. Bạn có thể thay thế bằng dữ liệu thực khi tích hợp backend sau này.</p>
                <p>Thunderbird là ứng dụng email và lịch trình đa nền tảng, mã nguồn mở hàng đầu, miễn phí cho doanh nghiệp và sử dụng cá nhân. Giao diện này được dựng tĩnh để bạn dễ dàng tuỳ biến.</p>
                <div className="rounded-lg border border-[oklch(0.28_0.01_260)] bg-[oklch(0.2_0.01_260)] p-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-white mb-2">
                    <Paperclip className="w-4 h-4" /> 2 tệp đính kèm
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {["bao-cao-q3.pdf", "lich-hop.ics"].map((f) => (
                      <div key={f} className="flex items-center gap-2 px-3 py-2 rounded border border-[oklch(0.28_0.01_260)] bg-[oklch(0.16_0.01_260)] text-xs">
                        <Files className="w-4 h-4 text-[oklch(0.6_0.15_255)]" />
                        <span className="truncate">{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <p>Trân trọng,<br />— {mail.from}</p>
              </article>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}



function IconBtn({ icon: Icon, onClick }: { icon: any; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="p-1.5 rounded hover:bg-[oklch(0.24_0.01_260)] text-[oklch(0.75_0.01_260)] hover:text-white">
      <Icon className="w-4 h-4" />
    </button>
  );
}