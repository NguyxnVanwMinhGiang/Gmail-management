import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';

import { Check, UserRound, Users, X } from 'lucide-react';
import { Fragment, useEffect, useState } from 'react';
import { useFriendRequests } from '../hooks/friend/useFriend';
import { Tooltip } from '@mui/material';

const formatRequestTime = (createdAt: string) => {
  const date = new Date(createdAt);

  if (Number.isNaN(date.getTime())) {
    return createdAt;
  }

  return new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
};

export default function FriendRequestPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const { requests, loadingFriendRequests, errorRequests, acceptRequest, rejectRequest, refreshRequests } = useFriendRequests({
    enableRequests: isOpen,
    enableFriends: false,
  });

  useEffect(() => {
    if (isOpen) {
      void refreshRequests();
    }
  }, [isOpen, refreshRequests]);

  return (
    <div className="flex items-center justify-center">
      {/* Nút bấm để mở Popup */}
      <Tooltip title="Lời mời kết bạn" arrow>
        <button onClick={() => setIsOpen(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded hover:bg-[oklch(0.22_0.01_260)] text-[oklch(0.7_0.01_260)]">
          <Users className="w-3.5 h-3.5" />
        </button>
      </Tooltip>

      {/* Quản lý hiệu ứng đóng/mở tổng thể */}
      <Transition show={isOpen} as={Fragment} >
        <Dialog as="div" className="relative z-50" onClose={() => setIsOpen(false)}>

          {/* Lớp nền mờ (Backdrop) phía sau */}
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
          </TransitionChild>

          {/* Vùng chứa căn giữa Popup */}
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">

              {/* Nội dung chính của Popup (Khung Dialog) */}
              <TransitionChild
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95 translate-y-4"
                enterTo="opacity-100 scale-100 translate-y-0"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100 translate-y-0"
                leaveTo="opacity-0 scale-95 translate-y-4"
              >
                <DialogPanel className="w-full text-left max-w-2xl transform overflow-hidden rounded-lg bg-white p-6 shadow-xl border border-gray-200">
                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between gap-4">
                      <DialogTitle className="text-xl font-bold text-gray-900">
                        Lời mời kết bạn
                      </DialogTitle>
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
                        {requests.length}
                      </span>
                    </div>

                    <div className="mt-6 space-y-3">
                      {loadingFriendRequests && (
                        <div className="rounded-lg border border-gray-100 bg-gray-50 p-4 text-sm text-gray-500">
                          Đang tải lời mời kết bạn...
                        </div>
                      )}

                      {!loadingFriendRequests && errorRequests && (
                        <div className="rounded-lg border border-red-100 bg-red-50 p-4 text-sm text-red-600">
                          {errorRequests instanceof Error ? errorRequests.message : "Đã xảy ra lỗi khi tải lời mời kết bạn."}
                        </div>
                      )}

                      {!loadingFriendRequests && !errorRequests && requests.length === 0 && (
                        <div className="rounded-lg border border-gray-100 bg-gray-50 p-4 text-sm text-gray-500">
                          Hiện chưa có lời mời kết bạn nào.
                        </div>
                      )}

                      {!loadingFriendRequests && requests.map((request) => {
                        const isProcessing = false;

                        return (
                          <div key={request.friendship_id} className="flex items-start gap-4 rounded-lg bg-gray-50 p-4 border border-gray-100">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white bg-blue-100 text-blue-700 shadow">
                              <UserRound className="h-6 w-6" />
                            </div>

                            <div className="min-w-0 flex-1">
                              <h3 className="truncate font-semibold text-gray-900">{request.sender_domain}</h3>
                              <p className="mt-1 text-sm text-gray-500">Trạng thái: {request.status}</p>
                              <span className="mt-2 block text-xs text-gray-400">{formatRequestTime(request.created_at)}</span>
                            </div>

                            <div className="flex shrink-0 gap-2">
                              <button
                                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 text-gray-700 transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-60"
                                type="button"
                                disabled={isProcessing}
                                title="Từ chối"
                                onClick={() => rejectRequest(request.friendship_id)}
                              >
                                <X className="h-4 w-4" />
                              </button>

                              <button
                                type="button"
                                disabled={isProcessing}
                                title="Đồng ý"
                                onClick={() => acceptRequest(request.friendship_id)}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                              >
                                <Check className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Footer */}

                </DialogPanel>
              </TransitionChild>

            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}
