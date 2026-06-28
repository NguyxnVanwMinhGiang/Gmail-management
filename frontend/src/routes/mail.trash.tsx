import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react';
import { Search, Reply, Forward, Star, RefreshCcwDot} from "lucide-react";
import IframeEmailViewer from "../components/mail/IframeRenderBodyMail";

import {useDecryptedBody} from "../hooks/useDecryptedBody";
import {useTrashQuery} from "../hooks/useInboxQuery";
import {useDecryptedHeaders} from "../hooks/useDecryptedHeaders";
import {useMailActions} from "../hooks/useMailActions";

export const Route = createFileRoute('/mail/trash')({
  component: Trash,
})

function Trash() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<number>(0);

  const { rawEmails, isLoading, error, fetchNextPage, hasNextPage, isFetchingNextPage } = useTrashQuery();

  const { decryptedHeaders, setDecryptedHeaders } = useDecryptedHeaders(rawEmails, navigate);
  const currentMailHeader = decryptedHeaders[selected] ?? null;
  const currentRawMail = rawEmails[selected] ?? null;
  const currentMailKey = currentRawMail ? String(currentRawMail.gmail_message_id) : null;

  const { activeBody, isDecryptingBody } = useDecryptedBody(currentMailKey);

  const { deleteMail, starMail } = useMailActions();

  const handleSelectMail = (index: number) => {
    setSelected(index);
    setDecryptedHeaders(curr => curr.map((item, idx) => idx === index ? { ...item, is_read: true } : item));
  };

  const handleDeleteMail = async (gmail_message_id: string, is_deleted: boolean) => {
    if (!currentRawMail) return;
    await deleteMail({
        id: gmail_message_id,
        is_deleted,
    });
  }

  // SỬA Ở ĐÂY: Dùng starMail thay cho starredEmail cũ
  const handleStarMail = async (gmail_message_id: string, is_starred: boolean) => {
    if (!currentRawMail) return;
    await starMail({
        id: gmail_message_id,
        is_starred
    });
  }

  // Logic cuộn tải thêm trang
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const bottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 50;
    if (bottom && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  if (isLoading) {
    return <div className="flex h-full items-center justify-center text-white bg-[oklch(0.16_0.01_260)]">Đang tải hộp thư...</div>;
  }

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

        <div className="flex-1 overflow-y-auto divide-y divide-[oklch(0.2_0.01_260)]" onScroll={handleScroll}>
          {decryptedHeaders.length === 0 ? (
            <div className="p-4 text-center text-sm text-[oklch(0.5_0.01_260)]">Không có thư nào trong hộp thư.</div>
          ) : (
            decryptedHeaders.map((item, index) => (
              <div
                key={item.gmail_message_id}
                onClick={() => handleSelectMail(index)}
                className={`p-3 cursor-pointer transition-colors ${selected === index
                  ? item.is_read
                    ? "bg-[oklch(0.2_0.01_260)] text-white"
                    : "bg-[oklch(0.28_0.03_255)] text-white shadow-[inset_0_0_0_1px_oklch(0.42_0.04_255)]"
                  : item.is_read
                    ? "hover:bg-[oklch(0.2_0.01_260)]"
                    : "bg-[oklch(0.28_0.03_255)] hover:bg-[oklch(0.3_0.03_255)] text-white shadow-[inset_0_0_0_1px_oklch(0.42_0.04_255)]"
                  }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className={`text-sm truncate pr-2 ${!item.is_read ? "font-bold text-white" : ""}`}>
                    {item.email_from?.split("<")[0].trim() || "Ẩn danh"}
                  </span>
                  <span className="text-xs text-[oklch(0.5_0.01_260)] whitespace-nowrap">
                    {item.received_at ? new Date(item.received_at).toLocaleDateString("vi-VN") : ""}
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

          {isFetchingNextPage && (
            <div className="p-4 text-center text-sm text-[oklch(0.5_0.01_260)]">
              Đang tải thêm thư...
            </div>
          )}
        </div>
      </div>

      {/* CỘT PHẢI: NỘI DUNG CHI TIẾT EMAIL */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0 h-screen bg-[oklch(0.14_0.01_260)]">
        {currentMailHeader ? (
          <div className="flex flex-col min-h-0 h-screen overflow-hidden">
            {/* Thanh công cụ */}
            <div className="p-2 border-b border-[oklch(0.24_0.01_260)] flex gap-2">
              <button onClick={() => handleDeleteMail(currentMailHeader.gmail_message_id, true)} className="p-1.5 hover:bg-[oklch(0.24_0.01_260)] rounded text-white"><Reply className="w-4 h-4" /></button>
              <button className="p-1.5 hover:bg-[oklch(0.24_0.01_260)] rounded text-white"><Forward className="w-4 h-4" /></button>
              <button onClick={() => handleStarMail(currentMailHeader.gmail_message_id, true)} className="p-1.5 hover:bg-[oklch(0.24_0.01_260)] rounded text-white "><Star className="w-4 h-4" /></button>
              <button onClick={() => handleDeleteMail(currentMailHeader.gmail_message_id, false)} className="p-1.5 hover:bg-[oklch(0.24_0.01_260)] rounded text-red-400"><RefreshCcwDot className="w-4 h-4" /></button>
            </div>

            {/* Khung nội dung */}
            <div className="p-3 pt-1 pb-0 flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
              <h1 className="text-xl font-bold text-white mb-4">Tiêu đề: {currentMailHeader.subject || "(Không có tiêu đề)"}</h1>

              <div className="flex justify-between border-b border-[oklch(0.2_0.01_260)] pb-4 mb-4 text-sm">
                <div>
                  <div className="text-white font-medium flex justify-between gap-7 items-center">
                      Từ: {currentMailHeader.email_from}
                  </div>

                  <div className="text-xs text-[oklch(0.5_0.01_260)] mt-0.5">Tới: {currentMailHeader.email_to || "me"}</div>
                </div>
                <div className="text-[oklch(0.5_0.01_260)] text-xs text-right">
                  {currentMailHeader.received_at ? new Date(currentMailHeader.received_at).toLocaleString("vi-VN") : ""}
                </div>
              </div>

              {/* KHU VỰC HIỂN THỊ NỘI DUNG HOẶC LOADING KHI ĐANG GIẢI MÃ CHI TIẾT */}
              <div className="text-white text-sm leading-relaxed email-content mb-8 flex-1 w-full flex flex-col">
                {isDecryptingBody ? (
                  <div className="flex items-center gap-2 text-[oklch(0.5_0.01_260)] text-xs animate-pulse">
                    🔒 Đang tải và giải mã nội dung bảo mật bằng khóa cấp 2...
                  </div>
                ) : activeBody ? (
                  activeBody.html ? (
                    // SỬA Ở ĐÂY: Thêm flex-1, w-full, và min-h-[65vh] (hoặc min-h-[500px])
                    <div className="flex-1 w-full min-h-[77vh] rounded-md overflow-hidden bg-white">
                      <IframeEmailViewer htmlContent={activeBody.html} />
                    </div>
                  ) : (
                    <p className="whitespace-pre-line">{activeBody.text}</p>
                  )
                ) : null}
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
