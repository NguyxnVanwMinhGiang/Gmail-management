import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react';
import { useFriendRequests } from '../hooks/friend/useFriend';
import { useDecryptedHeaders } from '../hooks/friend/useDecryptedHeaders';
import { useInboxQuery } from '../hooks/friend/useInboxQuery';
import { useDecryptedBody } from '../hooks/friend/useDecryptedBody';
import IframeEmailViewer from '../components/mail/IframeRenderBodyMail';

export const Route = createFileRoute('/mail/friends')({
    component: RouteComponent,
})

function RouteComponent() {
    const { friends, loadFriendList } = useFriendRequests();
    const navigate = useNavigate();
    const [selectedFriendId, setSelectedFriendId] = useState<number | null>(null);
    const [selectedMailIndex, setSelectedMailIndex] = useState<number | null>(null);

    const {
        rawEmails: rawInboxEmails,
        isLoading: isInboxLoading,
        error: inboxError,
        fetchNextPage: fetchNextInboxPage,
        hasNextPage: hasNextInboxPage,
        isFetchingNextPage: isFetchingNextInboxPage,
    } = useInboxQuery(selectedFriendId);

    const { decryptedHeaders: inboxHeaders, setDecryptedHeaders: setInboxHeaders } = useDecryptedHeaders(rawInboxEmails, navigate);

    const currentMailHeader = selectedMailIndex !== null ? inboxHeaders[selectedMailIndex] ?? null : null;

    const currentRawMail = selectedMailIndex !== null ? rawInboxEmails[selectedMailIndex] ?? null : null;
    const currentMailKey = currentRawMail ? String(currentRawMail.message_id) : null;

    const { activeBody, isDecryptingBody } = useDecryptedBody(currentMailKey, selectedFriendId);

    const handleSelectFriend = (friendId: number) => {
        setSelectedFriendId(friendId);
        setSelectedMailIndex(null);
        setInboxHeaders([]);
    };

    const handleSelectInboxMail = (index: number) => {
        setSelectedMailIndex(index);
        setInboxHeaders(curr => curr.map((item, idx) => idx === index ? { ...item, is_read: true } : item));
    };


    const handleScroll = (
        fetchNextPage: () => void,
        hasNextPage: boolean,
        isFetchingNextPage: boolean,
    ) => (e: React.UIEvent<HTMLDivElement>) => {
        const target = e.currentTarget;
        const bottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 50;
        if (bottom && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    };

    return (
        <div className="flex h-screen w-full bg-[oklch(0.16_0.01_260)] text-[oklch(0.7_0.01_260)] overflow-hidden flex-col lg:flex-row">
            <div className="flex w-full lg:w-[42%] xl:w-[38%] min-w-0 h-full">
                <div className="w-[40%]
                    min-w-62.5
                    max-w-85
                    border-r
                    border-[oklch(0.24_0.01_260)]
                    flex
                    flex-col
                    h-full">
                    <div className="p-4 border-b border-[oklch(0.24_0.01_260)] bg-[oklch(0.12_0.01_260)]">
                        <div className="relative text-center py-1 px-4">
                            <span className="text-[oklch(0.85_0.01_260)] font-medium tracking-wide">
                                Danh sách bạn bè
                            </span>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto divide-y divide-[oklch(0.2_0.01_260)] p-4">
                        {loadFriendList ? (
                            <div className="text-center py-4 text-[oklch(0.6_0.01_260)] text-sm animate-pulse">
                                Đang tải danh sách...
                            </div>
                        ) : friends.length === 0 ? (
                            <div className="text-center py-8 text-[oklch(0.5_0.01_260)] text-sm">
                                Chưa có người bạn nào.
                            </div>
                        ) : (
                            friends.map((friend) => (
                                <button
                                    key={`${friend.friend_id}_${friend.domain}`}
                                    type="button"
                                    onClick={() => handleSelectFriend(friend.friend_id)}
                                    className={`flex w-full items-center justify-between py-3 px-3 hover:bg-[oklch(0.18_0.01_260)] transition-colors rounded-lg group cursor-pointer border-none text-left ${selectedFriendId === friend.friend_id ? 'bg-[oklch(0.22_0.03_255)] shadow-[inset_0_0_0_1px_oklch(0.42_0.04_255)]' : ''}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-[oklch(0.24_0.01_260)] flex items-center justify-center text-[oklch(0.85_0.01_260)] font-bold uppercase border border-[oklch(0.3_0.01_260)] group-hover:border-[oklch(0.5_0.01_260)] transition-colors">
                                            {friend.domain ? friend.domain[0] : '?'}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[oklch(0.85_0.01_260)] font-medium text-sm group-hover:text-white transition-colors">
                                                {friend.domain}
                                            </span>
                                            <span className="text-[oklch(0.5_0.01_260)] text-xs pt-1">
                                                {friend.created_at ? friend.created_at.split(' ')[0] : ''}
                                            </span>
                                        </div>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                <div className="flex-1
                        min-w-[320px]
                        border-r
                        border-[oklch(0.24_0.01_260)]
                        flex
                        flex-col
                        h-full
                    ">
                    <div className="p-4 border-b border-[oklch(0.24_0.01_260)] bg-[oklch(0.12_0.01_260)]">
                        <div className="relative text-center py-1 px-4">
                            <span className="text-[oklch(0.85_0.01_260)] font-medium tracking-wide">
                                Thư từ bạn bè
                            </span>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto divide-y divide-[oklch(0.2_0.01_260)]" onScroll={handleScroll(fetchNextInboxPage, hasNextInboxPage, isFetchingNextInboxPage)}>
                        {inboxError ? (
                            <div className="p-4 text-center text-sm text-red-400">Không tải được thư đến.</div>
                        ) : !selectedFriendId ? (
                            <div className="p-4 text-center text-sm text-[oklch(0.5_0.01_260)]">Chọn một người bạn để xem thư riêng.</div>
                        ) : isInboxLoading ? (
                            <div className="p-4 text-center text-sm text-[oklch(0.5_0.01_260)] animate-pulse">Đang tải thư đến...</div>
                        ) : inboxHeaders.length === 0 ? (
                            <div className="p-4 text-center text-sm text-[oklch(0.5_0.01_260)]">Không có thư nào từ người bạn này.</div>
                        ) : (
                            inboxHeaders.map((item, index) => (
                                <div
                                    key={item.message_id}
                                    onClick={() => handleSelectInboxMail(index)}
                                    className={`p-3 cursor-pointer transition-colors ${selectedMailIndex === index
                                        ? item.is_read
                                            ? 'bg-[oklch(0.2_0.01_260)] text-white'
                                            : 'bg-[oklch(0.28_0.03_255)] text-white shadow-[inset_0_0_0_1px_oklch(0.42_0.04_255)]'
                                        : item.is_read
                                            ? 'hover:bg-[oklch(0.2_0.01_260)]'
                                            : 'bg-[oklch(0.28_0.03_255)] hover:bg-[oklch(0.3_0.03_255)] text-white shadow-[inset_0_0_0_1px_oklch(0.42_0.04_255)]'
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <span className={`text-sm truncate pr-2 ${!item.is_read ? 'font-bold text-white' : ''}`}>
                                            {item.email_from?.split('<')[0].trim() || 'Ẩn danh'}
                                        </span>
                                        <span className="text-xs text-[oklch(0.5_0.01_260)] whitespace-nowrap">
                                            {item.received_at ? new Date(item.received_at).toLocaleDateString('vi-VN') : ''}
                                        </span>
                                    </div>
                                    <div className={`text-xs truncate mb-1 ${!item.is_read ? 'font-semibold text-[oklch(0.85_0.02_255)]' : ''}`}>
                                        {item.subject || '(Không có tiêu đề)'}
                                    </div>
                                    <div className="text-xs text-[oklch(0.5_0.01_260)] truncate">
                                        {item.snippet}
                                    </div>
                                </div>
                            ))
                        )}

                        {isFetchingNextInboxPage && (
                            <div className="p-4 text-center text-sm text-[oklch(0.5_0.01_260)]">
                                Đang tải thêm thư...
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex-1 flex flex-col w-full min-w-0 min-h-0 h-screen bg-[oklch(0.14_0.01_260)]">
                {currentMailHeader ? (
                    <div className="flex flex-col min-h-0 h-full overflow-hidden">
                        <div className="p-4 border-b border-[oklch(0.24_0.01_260)] flex gap-2 justify-center items-center bg-[oklch(0.12_0.01_260)]">
                            Nội dung chi tiết thư
                        </div>

                        <div className="p-3 pt-1 pb-0 flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
                            <h1 className="text-xl font-bold text-white mb-4">Tiêu đề: {currentMailHeader.subject || '(Không có tiêu đề)'}</h1>

                            <div className="flex justify-between border-b border-[oklch(0.2_0.01_260)] pb-4 mb-4 text-sm">
                                <div>
                                    <div className="text-white font-medium flex justify-between gap-7 items-center">
                                        Từ: {currentMailHeader.email_from}
                                    </div>

                                    <div className="text-xs text-[oklch(0.5_0.01_260)] mt-0.5">Tới: {currentMailHeader.email_to || 'me'}</div>
                                </div>
                                <div className="text-[oklch(0.5_0.01_260)] text-xs text-right">
                                    {currentMailHeader.received_at ? new Date(currentMailHeader.received_at).toLocaleString('vi-VN') : ''}
                                </div>
                            </div>

                            <div className="text-white text-sm leading-relaxed email-content mb-8 flex-1 w-full flex flex-col">
                                {isDecryptingBody ? (
                                    <div className="flex items-center gap-2 text-[oklch(0.5_0.01_260)] text-xs animate-pulse">
                                        🔒 Đang tải và giải mã nội dung bảo mật bằng khóa cấp 2...
                                    </div>
                                ) : activeBody ? (
                                    activeBody.html ? (
                                        <div className="flex-1 w-full h-full min-h-125 overflow-hidden rounded-lg bg-white">
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
    )
}