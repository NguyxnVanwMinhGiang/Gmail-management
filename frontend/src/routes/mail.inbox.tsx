import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Trash2, Search, Reply, Forward, Star } from "lucide-react";
import { Tooltip } from "@mui/material";

import IframeEmailViewer from "../components/mail/IframeRenderBodyMail";
import { useDecryptedBody } from "../hooks/useDecryptedBody";
import { useInboxQuery } from "../hooks/useInboxQuery";
import { useDecryptedHeaders } from "../hooks/useDecryptedHeaders";
import { useMailActions } from "../hooks/useMailActions";
import GroupAssignMenu from "../components/mail/GroupAssignMenu";
import { useToggleEmailInGroup } from "../hooks/useEmailGroups";
import { useEmailGroupMembership } from "../hooks/useEmailGroupMembership";

export const Route = createFileRoute("/mail/inbox")({
  component: Index,
});

function Index() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<number>(0);
  const { rawEmails, isLoading, error, fetchNextPage, hasNextPage, isFetchingNextPage } = useInboxQuery();
  const { decryptedHeaders, setDecryptedHeaders } = useDecryptedHeaders(rawEmails, navigate);
  const currentMailHeader = decryptedHeaders[selected] ?? null;
  const currentRawMail = rawEmails[selected] ?? null;
  const currentMailKey = currentRawMail ? String(currentRawMail.message_id) : null;
  const { activeBody, isDecryptingBody } = useDecryptedBody(currentMailKey);
  const { deleteMail, starMail } = useMailActions();
  const toggleGroupMutation = useToggleEmailInGroup();
  const { groups, activeGroupIds } = useEmailGroupMembership(currentRawMail?.id);

  const handleSelectMail = (index: number) => {
    setSelected(index);
    setDecryptedHeaders((curr) => curr.map((item, idx) => (idx === index ? { ...item, is_read: true } : item)));
  };

  const handleDeleteMail = async (message_id: string, is_deleted: boolean) => {
    if (!currentRawMail) return;
    await deleteMail({ id: message_id, is_deleted });
  };

  const handleStarMail = async (message_id: string, is_starred: boolean) => {
    if (!currentRawMail) return;
    await starMail({ id: message_id, is_starred });
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const bottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 50;
    if (bottom && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  if (isLoading) {
    return <div className="flex h-full items-center justify-center bg-[oklch(0.16_0.01_260)] text-white">Đang tải hộp thư...</div>;
  }

  if (error) {
    return <div className="flex h-full items-center justify-center bg-[oklch(0.16_0.01_260)] text-red-400">Lỗi: {(error as Error).message}</div>;
  }

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-[oklch(0.16_0.01_260)] text-[oklch(0.7_0.01_260)] md:flex-row">
      <div className="flex h-full w-full flex-col border-r border-[oklch(0.24_0.01_260)] md:w-1/3">
        <div className="border-b border-[oklch(0.24_0.01_260)] p-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-[oklch(0.5_0.01_260)]" />
            <input type="search" placeholder="Tìm kiếm thư..." className="w-full rounded border border-[oklch(0.24_0.01_260)] bg-[oklch(0.12_0.01_260)] py-2 pl-9 pr-4 text-sm text-white" />
          </div>
        </div>

        <div className="flex-1 divide-y divide-[oklch(0.2_0.01_260)] overflow-y-auto" onScroll={handleScroll}>
          {decryptedHeaders.length === 0 ? (
            <div className="p-4 text-center text-sm text-[oklch(0.5_0.01_260)]">Không có thư nào trong hộp thư.</div>
          ) : (
            decryptedHeaders.map((item, index) => (
              <div key={item.message_id} onClick={() => handleSelectMail(index)} className={`cursor-pointer p-3 transition-colors ${selected === index ? "bg-[oklch(0.2_0.01_260)] text-white" : "hover:bg-[oklch(0.2_0.01_260)]"}`}>
                <div className="mb-1 flex items-start justify-between gap-2">
                  <span className={`truncate pr-2 text-sm ${!item.is_read ? "font-bold text-white" : ""}`}>{item.email_from?.split("<")[0].trim() || "Ẩn danh"}</span>
                  <span className="whitespace-nowrap text-xs text-[oklch(0.5_0.01_260)]">{item.received_at ? new Date(item.received_at).toLocaleDateString("vi-VN") : ""}</span>
                </div>
                <div className={`mb-1 truncate text-xs ${!item.is_read ? "font-semibold text-[oklch(0.85_0.02_255)]" : ""}`}>{item.subject || "(Không có tiêu đề)"}</div>
                <div className="flex items-center justify-between gap-2 text-xs text-[oklch(0.5_0.01_260)]">
                  <span className="truncate w-2/3">{item.snippet}</span>
                  <GroupAssignMenu
                    groups={groups}
                    activeGroupIds={activeGroupIds}
                    onToggle={async (groupId) => {
                      if (!currentRawMail?.id) return;
                      await toggleGroupMutation.mutateAsync({ groupId, emailId: currentRawMail.id });
                    }}
                    onCreateGroup={() => navigate({ to: "/mail" })}
                  />
                </div>
              </div>
            ))
          )}

          {isFetchingNextPage && <div className="p-4 text-center text-sm text-[oklch(0.5_0.01_260)]">Đang tải thêm thư...</div>}
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col bg-[oklch(0.14_0.01_260)]">
        {currentMailHeader ? (
          <div className="flex h-screen min-h-0 flex-col overflow-hidden">
            <div className="flex gap-2 border-b border-[oklch(0.24_0.01_260)] p-2">
              <Tooltip title="Trả lời" arrow><button onClick={() => handleDeleteMail(currentMailHeader.message_id, true)} className="rounded p-1.5 text-white hover:bg-[oklch(0.24_0.01_260)]"><Reply className="h-4 w-4" /></button></Tooltip>
              <Tooltip title="Chuyển tiếp" arrow><button className="rounded p-1.5 text-white hover:bg-[oklch(0.24_0.01_260)]"><Forward className="h-4 w-4" /></button></Tooltip>
              <Tooltip title="Đánh dấu" arrow><button onClick={() => handleStarMail(currentMailHeader.message_id, true)} className="rounded p-1.5 text-white hover:bg-[oklch(0.24_0.01_260)]"><Star className="h-4 w-4" /></button></Tooltip>
              <Tooltip title="Xóa" arrow><button onClick={() => handleDeleteMail(currentMailHeader.message_id, true)} className="rounded p-1.5 text-red-400 hover:bg-[oklch(0.24_0.01_260)]"><Trash2 className="h-4 w-4" /></button></Tooltip>
            </div>

            <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 pt-1 pb-0">
              <h1 className="mb-4 text-xl font-bold text-white">Tiêu đề: {currentMailHeader.subject || "(Không có tiêu đề)"}</h1>
              <div className="mb-4 flex justify-between border-b border-[oklch(0.2_0.01_260)] pb-4 text-sm">
                <div>
                  <div className="flex justify-between gap-7 font-medium text-white">Từ: {currentMailHeader.email_from}</div>
                  <div className="mt-0.5 text-xs text-[oklch(0.5_0.01_260)]">Tới: {currentMailHeader.email_to || "me"}</div>
                </div>
                <div className="text-right text-xs text-[oklch(0.5_0.01_260)]">{currentMailHeader.received_at ? new Date(currentMailHeader.received_at).toLocaleString("vi-VN") : ""}</div>
              </div>

              <div className="email-content mb-8 flex w-full flex-1 flex-col text-sm leading-relaxed text-white">
                {isDecryptingBody ? (
                  <div className="flex items-center gap-2 text-xs text-[oklch(0.5_0.01_260)] animate-pulse">🔒 Đang tải và giải mã nội dung...</div>
                ) : activeBody ? (
                  activeBody.html ? (
                    <div className="min-h-[77vh] w-full flex-1 overflow-hidden bg-white">
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
          <div className="flex h-full items-center justify-center text-[oklch(0.5_0.01_260)]">Chọn một thư để xem nội dung chi tiết</div>
        )}
      </div>
    </div>
  );
}
