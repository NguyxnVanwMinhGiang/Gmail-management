import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
// Lưu ý: Đảm bảo đường dẫn import này trỏ đúng tới file chứa API của bạn
import { getInbox } from "../api/gmail"; 

import {
  Files, Trash2,
  Search, Reply, ReplyAll, Forward, Archive, Paperclip
} from "lucide-react";

export const Route = createFileRoute("/mail/inbox")({
  head: () => ({
    meta: [
      { title: "Thunderbird Clone — Hộp thư" },
      { name: "description", content: "Giao diện hộp thư lấy dữ liệu dynamic từ Gmail API với tính năng cuộn vô hạn." },
    ],
  }),
  component: Index,
});

function Index() {
  const [selected, setSelected] = useState<number>(0);

  // 1. Cấu hình useInfiniteQuery cho tính năng cuộn để tải thêm
  const { 
    data, 
    isLoading, 
    isFetchingNextPage, 
    fetchNextPage, 
    hasNextPage,
    error 
  } = useInfiniteQuery({
  queryKey: ["inbox"],
  // Lấy pageParam từ tham số ngầm của React Query và truyền vào getInbox
  queryFn: ({ pageParam = 1 }) => getInbox(pageParam as number, 20), 
  initialPageParam: 1,
  getNextPageParam: (lastPage, allPages) => {
    return lastPage.length === 20 ? allPages.length + 1 : undefined;
  },
  staleTime: 1000 * 60,
});

  // 2. Gộp tất cả các trang (pages) thành một mảng email duy nhất để dễ hiển thị
  const emails = data?.pages.flat() || [];
  
  // 3. Lấy ra email đang được chọn để hiển thị ở cột bên phải
  const mail = emails[selected] ?? null;

  // 4. Hàm xử lý sự kiện cuộn chuột
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    // Tính toán khoảng cách từ thanh cuộn đến đáy (cách đáy 50px thì kích hoạt)
    const bottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 50;
    
    // Nếu chạm đáy, còn trang để tải và hệ thống không bận -> Gọi trang tiếp theo
    if (bottom && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  // Trạng thái Loading ban đầu
  if (isLoading) {
    return <div className="flex h-full items-center justify-center text-white bg-[oklch(0.16_0.01_260)]">Đang tải hộp thư...</div>;
  }

  // Trạng thái Lỗi API
  if (error) {
    return <div className="flex h-full items-center justify-center text-red-400 bg-[oklch(0.16_0.01_260)]">Lỗi: {(error as Error).message}</div>;
  }

  return (
    <div className="flex h-full w-full bg-[oklch(0.16_0.01_260)] text-[oklch(0.7_0.01_260)] flex-col md:flex-row overflow-hidden">
      
      {/* CỘT TRÁI: DANH SÁCH EMAIL */}
      <div className="w-full md:w-1/3 border-r border-[oklch(0.24_0.01_260)] flex flex-col h-full">
        <div className="p-2 border-b border-[oklch(0.24_0.01_260)]">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-[oklch(0.5_0.01_260)]" />
            <input
              type="search"
              placeholder="Tìm kiếm thư..."
              className="w-full bg-[oklch(0.12_0.01_260)] pl-9 pr-4 py-2 rounded border border-[oklch(0.24_0.01_260)] text-sm text-white"
            />
          </div>
        </div>

        {/* Khung chứa danh sách có gắn onScroll */}
        <div 
          className="flex-1 overflow-y-auto divide-y divide-[oklch(0.2_0.01_260)]"
          onScroll={handleScroll}
        >
          {emails.length === 0 ? (
            <div className="p-4 text-center text-sm text-[oklch(0.5_0.01_260)]">Không có thư nào trong hộp thư.</div>
          ) : (
            emails.map((item, index) => (
              <div
                key={item.id || item.gmail_message_id}
                onClick={() => setSelected(index)}
                className={`p-3 cursor-pointer transition-colors ${
                  selected === index 
                    ? "bg-[oklch(0.24_0.02_255)] text-white" 
                    : "hover:bg-[oklch(0.2_0.01_260)]"
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className={`text-sm truncate pr-2 ${!item.is_read ? "font-bold text-white" : ""}`}>
                    {item.email_from?.split("<")[0].trim() || "Ẩn danh"}
                  </span>
                  <span className="text-xs text-[oklch(0.5_0.01_260)] whitespace-nowrap">
                    {item.sent_at ? new Date(item.sent_at).toLocaleDateString("vi-VN") : ""}
                  </span>
                </div>
                <div className={`text-xs truncate mb-1 ${!item.is_read ? "font-semibold text-[oklch(0.85_0.02_255)]" : ""}`}>
                  {item.subject || "(Không có tiêu đề)"}
                </div>
                <div className="text-xs text-[oklch(0.5_0.01_260)] truncate">
                  {item.snippet}
                </div>
              </div>
            ))
          )}

          {/* Hiển thị dòng chữ Loading... khi đang cuộn xuống lấy thêm dữ liệu */}
          {isFetchingNextPage && (
            <div className="p-4 text-center text-sm text-[oklch(0.5_0.01_260)]">
              Đang tải thêm thư...
            </div>
          )}
        </div>
      </div>

      {/* CỘT PHẢI: NỘI DUNG CHI TIẾT EMAIL */}
      <div className="flex-1 flex flex-col h-full bg-[oklch(0.14_0.01_260)]">
        {mail ? (
          <div className="flex flex-col h-full overflow-hidden">
            {/* Thanh công cụ */}
            <div className="p-2 border-b border-[oklch(0.24_0.01_260)] flex gap-2">
              <button className="p-1.5 hover:bg-[oklch(0.24_0.01_260)] rounded text-white" title="Trả lời"><Reply className="w-4 h-4" /></button>
              <button className="p-1.5 hover:bg-[oklch(0.24_0.01_260)] rounded text-white" title="Trả lời tất cả"><ReplyAll className="w-4 h-4" /></button>
              <button className="p-1.5 hover:bg-[oklch(0.24_0.01_260)] rounded text-white" title="Chuyển tiếp"><Forward className="w-4 h-4" /></button>
              <button className="p-1.5 hover:bg-[oklch(0.24_0.01_260)] rounded text-white" title="Lưu trữ"><Archive className="w-4 h-4" /></button>
              <button className="p-1.5 hover:bg-[oklch(0.24_0.01_260)] rounded text-red-400" title="Xóa"><Trash2 className="w-4 h-4" /></button>
            </div>

            {/* Khung nội dung */}
            <div className="p-6 flex-1 overflow-y-auto">
              <h1 className="text-xl font-bold text-white mb-4">{mail.subject || "(Không có tiêu đề)"}</h1>
              
              <div className="flex justify-between border-b border-[oklch(0.2_0.01_260)] pb-4 mb-4 text-sm">
                <div>
                  <div className="text-white font-medium">{mail.email_from}</div>
                  <div className="text-xs text-[oklch(0.5_0.01_260)] mt-0.5">Tới: {mail.email_to || "me"}</div>
                </div>
                <div className="text-[oklch(0.5_0.01_260)] text-xs text-right">
                  {mail.sent_at ? new Date(mail.sent_at).toLocaleString("vi-VN") : ""}
                </div>
              </div>

              {/* Render nội dung HTML từ API */}
              <div className="text-white text-sm leading-relaxed email-content mb-8">
                {mail.body_html ? (
                  <div dangerouslySetInnerHTML={{ __html: mail.body_html }} />
                ) : (
                  <p className="whitespace-pre-line">{mail.body_text || mail.snippet}</p>
                )}
              </div>

              {/* Khu vực file đính kèm (Tôi giữ lại giao diện UI cũ của bạn để không bị vỡ Layout) */}
              <div className="rounded-lg border border-[oklch(0.28_0.01_260)] bg-[oklch(0.2_0.01_260)] p-4 mt-auto">
                <div className="flex items-center gap-2 text-sm font-medium text-white mb-2">
                  <Paperclip className="w-4 h-4" /> Tệp đính kèm (Demo)
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
            </div>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center text-[oklch(0.5_0.01_260)]">
            Chọn một thư để xem nội dung chi tiết
          </div>
        )}
      </div>
    </div>
  );
}