// src/routes/mail.inbox.tsx
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useRef, startTransition } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getInbox, type EmailItem } from "../api/gmail";
import * as openpgp from 'openpgp';
import { decryptPGPText } from "../api/openpgp"; // Chỉ cần import hàm decrypt chuỗi lẻ

import {
  Trash2,
  Search, Reply, ReplyAll, Forward, Archive
} from "lucide-react";

export const Route = createFileRoute("/mail/inbox")({
  component: Index,
});

type DecryptedEmailItem = EmailItem & {
  subject: string;
  snippet: string;
};

function Index() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<number>(0);

  // Cache để tránh giải mã lại cùng một email mỗi lần query refetch hoặc component render lại.
  const decryptedHeaderCacheRef = useRef<Map<string, DecryptedEmailItem>>(new Map());
  const decryptedBodyCacheRef = useRef<Map<string, { html: string; text: string }>>(new Map());

  // 1. STATE LƯU TRỮ DANH SÁCH EMAIL ĐÃ ĐƯỢC GIẢI MÃ SƠ BỘ (Chỉ giải mã Tiêu đề & Snippet)
  const [decryptedHeaders, setDecryptedHeaders] = useState<DecryptedEmailItem[]>([]);

  // 2. STATE LƯU TRỮ NỘI DUNG CHI TIẾT ĐÃ GIẢI MÃ CỦA EMAIL ĐANG XEM
  const [activeBody, setActiveBody] = useState<{ html: string; text: string } | null>(null);
  const [isDecryptingBody, setIsDecryptingBody] = useState<boolean>(false);

  // Cấu hình useInfiniteQuery lấy dữ liệu gốc (mã hóa) từ Server
  const {
    data,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    error
  } = useInfiniteQuery({
    queryKey: ["inbox"],
    queryFn: ({ pageParam = 1 }) => getInbox(pageParam as number, 20),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === 20 ? allPages.length + 1 : undefined;
    },
    staleTime: 1000 * 60,
  });

  const rawEmails = data?.pages.flat() || [];
  const currentMailHeader = decryptedHeaders[selected] ?? null;
  const currentRawMail = rawEmails[selected] ?? null;
  const currentMailKey = currentRawMail ? String(currentRawMail.id ?? currentRawMail.gmail_message_id) : null;

  // EFFECT 1: CHỈ GIẢI MÃ TIÊU ĐỀ & SNIPPET CHO DANH SÁCH BÊN TRÁI (Cực kỳ nhanh)
  useEffect(() => {
    let isCancelled = false;

    const decryptHeadersOnly = async () => {
      if (rawEmails.length === 0) {
        startTransition(() => setDecryptedHeaders([]));
        return;
      }

      const armoredKey = sessionStorage.getItem('unlocked_private_key');
      if (!armoredKey) {
        navigate({ to: "/e2ee" });
        return;
      }

      try {
        const privateKeyObj = await openpgp.readPrivateKey({ armoredKey });

        // Chỉ lặp giải mã các trường phục vụ hiển thị danh sách (không giải mã body_text/html)
        const updatedList = await Promise.all(
          rawEmails.map(async (email) => {
            const cacheKey = String(email.id ?? email.gmail_message_id);
            const cached = decryptedHeaderCacheRef.current.get(cacheKey);
            if (cached) {
              return cached;
            }

            const [subject, snippet] = await Promise.all([
              decryptPGPText(email.subject ?? "", privateKeyObj),
              decryptPGPText(email.snippet ?? "", privateKeyObj)
            ]);

            const decryptedEmail = {
              ...email,
              subject,
              snippet
            } as DecryptedEmailItem;

            decryptedHeaderCacheRef.current.set(cacheKey, decryptedEmail);
            return decryptedEmail;
          })
        );

        if (!isCancelled) {
          startTransition(() => setDecryptedHeaders(updatedList));
        }
      } catch (err) {
        console.error("Lỗi giải mã danh sách header:", err);
      }
    };

    decryptHeadersOnly();
    return () => {
      isCancelled = true;
    };
  }, [rawEmails, navigate]);


  // EFFECT 2: CHỈ GIẢI MÃ NỘI DUNG CHI TIẾT (BODY) KHI NGƯỜI DÙNG CLICK CHỌN THƯ
  useEffect(() => {
    let isCancelled = false;

    const decryptCurrentBody = async () => {
      if (!currentRawMail || !currentMailKey) {
        startTransition(() => setActiveBody(null));
        return;
      }

      const armoredKey = sessionStorage.getItem('unlocked_private_key');
      if (!armoredKey) return;

      const cachedBody = decryptedBodyCacheRef.current.get(currentMailKey);
      if (cachedBody) {
        startTransition(() => setActiveBody(cachedBody));
        return;
      }

      setIsDecryptingBody(true);
      try {
        const privateKeyObj = await openpgp.readPrivateKey({ armoredKey });

        // Tiến hành giải mã cục bộ duy nhất phần thân của email này
        const [bodyHtml, bodyText] = await Promise.all([
          decryptPGPText(currentRawMail.body_html ?? "", privateKeyObj),
          decryptPGPText(currentRawMail.body_text ?? "", privateKeyObj)
        ]);

        const decryptedBody = {
          html: bodyHtml,
          text: bodyText
        };

        decryptedBodyCacheRef.current.set(currentMailKey, decryptedBody);

        if (!isCancelled) {
          startTransition(() => setActiveBody(decryptedBody));
        }
      } catch (err) {
        console.error("Lỗi giải mã nội dung chi tiết thư:", err);
        if (!isCancelled) {
          startTransition(() => setActiveBody({ html: "", text: "--- Lỗi: Không thể giải mã nội dung chi tiết thư ---" }));
        }
      } finally {
        if (!isCancelled) {
          setIsDecryptingBody(false);
        }
      }
    };

    decryptCurrentBody();
    return () => {
      isCancelled = true;
    };
  }, [currentMailKey, currentRawMail]);


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
                key={item.id || item.gmail_message_id}
                onClick={() => setSelected(index)}
                className={`p-3 cursor-pointer transition-colors ${selected === index
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

          {isFetchingNextPage && (
            <div className="p-4 text-center text-sm text-[oklch(0.5_0.01_260)]">
              Đang tải thêm thư...
            </div>
          )}
        </div>
      </div>

      {/* CỘT PHẢI: NỘI DUNG CHI TIẾT EMAIL */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0 h-full bg-[oklch(0.14_0.01_260)]">
        {currentMailHeader ? (
          <div className="flex flex-col min-h-0 h-full overflow-hidden">
            {/* Thanh công cụ */}
            <div className="p-2 border-b border-[oklch(0.24_0.01_260)] flex gap-2">
              <button className="p-1.5 hover:bg-[oklch(0.24_0.01_260)] rounded text-white"><Reply className="w-4 h-4" /></button>
              <button className="p-1.5 hover:bg-[oklch(0.24_0.01_260)] rounded text-white"><ReplyAll className="w-4 h-4" /></button>
              <button className="p-1.5 hover:bg-[oklch(0.24_0.01_260)] rounded text-white"><Forward className="w-4 h-4" /></button>
              <button className="p-1.5 hover:bg-[oklch(0.24_0.01_260)] rounded text-white"><Archive className="w-4 h-4" /></button>
              <button className="p-1.5 hover:bg-[oklch(0.24_0.01_260)] rounded text-red-400"><Trash2 className="w-4 h-4" /></button>
            </div>

            {/* Khung nội dung */}
            <div className="p-6 flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
              <h1 className="text-xl font-bold text-white mb-4">{currentMailHeader.subject || "(Không có tiêu đề)"}</h1>

              <div className="flex justify-between border-b border-[oklch(0.2_0.01_260)] pb-4 mb-4 text-sm">
                <div>
                  <div className="text-white font-medium">{currentMailHeader.email_from}</div>
                  <div className="text-xs text-[oklch(0.5_0.01_260)] mt-0.5">Tới: {currentMailHeader.email_to || "me"}</div>
                </div>
                <div className="text-[oklch(0.5_0.01_260)] text-xs text-right">
                  {currentMailHeader.sent_at ? new Date(currentMailHeader.sent_at).toLocaleString("vi-VN") : ""}
                </div>
              </div>

              {/* KHU VỰC HIỂN THỊ NỘI DUNG HOẶC LOADING KHI ĐANG GIẢI MÃ CHI TIẾT */}
              <div className="text-white text-sm leading-relaxed email-content mb-8 min-h-25 max-w-full overflow-x-auto wrap-break-word whitespace-pre-wrap [&_img]:max-w-full [&_img]:h-auto [&_table]:max-w-full [&_pre]:whitespace-pre-wrap [&_pre]:wrap-break-word">
                {isDecryptingBody ? (
                  <div className="flex items-center gap-2 text-[oklch(0.5_0.01_260)] text-xs animate-pulse">
                    🔒 Đang giải mã nội dung bảo mật bằng khóa cấp 2...
                  </div>
                ) : activeBody ? (
                  activeBody.html ? (
                    <div className="max-w-full" dangerouslySetInnerHTML={{ __html: activeBody.html }} />
                  ) : (
                    <p className="whitespace-pre-line">{activeBody.text || currentMailHeader.snippet}</p>
                  )
                ) : null}
              </div>

              {/* Tệp đính kèm */}
              {/* <div className="rounded-lg border border-[oklch(0.28_0.01_260)] bg-[oklch(0.2_0.01_260)] p-4 mt-auto">
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
              </div> */}
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