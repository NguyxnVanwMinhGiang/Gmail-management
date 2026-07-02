import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';

import { UserRoundPlus } from 'lucide-react';
import { Fragment, useState } from 'react';

export default function PopupHeadless() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAgree, setIsAgree] = useState(false);
  return (
    <div className="flex items-center justify-center">
      {/* Nút bấm để mở Popup */}
      <button onClick={() => setIsOpen(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded hover:bg-[oklch(0.22_0.01_260)] text-[oklch(0.7_0.01_260)]">
        <UserRoundPlus className="w-3.5 h-3.5" />
      </button>

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
                <DialogPanel className="w-full text-left max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl border border-gray-200">
                  <div>
                    {/* Header */}
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
                        <span className="text-2xl">🔐</span>
                      </div>

                      <div>
                        <DialogTitle className="text-xl font-bold text-gray-900">
                          Chia sẻ Public Key khi kết bạn
                        </DialogTitle>

                        <p className="mt-1 text-sm text-gray-500">
                          Vui lòng đọc kỹ các thông tin dưới đây trước khi tiếp tục.
                        </p>
                      </div>
                    </div>

                    {/* Nội dung */}
                    <div className="mt-6 rounded-xl border border-yellow-200 bg-yellow-50 p-5">

                      <h4 className="font-semibold text-yellow-900 mb-4">
                        Khi kết bạn, hệ thống sẽ:
                      </h4>

                      <div className="space-y-3 text-sm text-gray-700">

                        <div className="flex items-center gap-3">
                          <span className="text-green-600 font-bold text-lg">✓</span>
                          <p>
                            Chỉ chia sẻ <b>Public Key</b> của bạn với người được kết bạn.
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-green-600 font-bold text-lg">✓</span>
                          <p>
                            <b>Private Key</b> sẽ không bao giờ được gửi cho bất kỳ ai.
                          </p>
                        </div>

                        <div className="flex items-center gap-3 ">
                          <span className="text-green-600 font-bold text-lg">✓</span>
                          <p>
                            Sau khi kết bạn, hai bên có thể sử dụng Public Key của nhau để
                            gửi email được mã hóa đầu cuối (End-to-End Encryption).
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-green-600 font-bold text-lg">✓</span>
                          <p>
                            Chỉ người sở hữu <b>Private Key</b> mới có thể giải mã và đọc
                            nội dung email.
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-red-500 font-bold text-lg">⚠</span>
                          <p>
                            Chỉ kết bạn với những người bạn tin tưởng và đã xác minh đúng
                            danh tính của họ.
                          </p>
                        </div>

                      </div>
                    </div>
                    <div className="flex items-start gap-3 mt-3">
                      <div className="flex h-12 w-12 items-center justify-center">
                        <span className="text-2xl">📩</span>
                      </div>

                      <div>
                        <DialogTitle className="text-xl font-bold text-gray-900">
                          Chia sẻ Public Key với bạn bè
                        </DialogTitle>

                        <p className="mt-1 text-sm text-gray-500">
                          Hệ thống sẽ tự động gửi Public Key của bạn đến email bạn bè mà bạn nhập vào. Bạn bè của bạn sẽ nhận được Public Key và có thể sử dụng nó để gửi email được mã hóa đầu cuối cho bạn.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mt-6 rounded-xl border border-blue-200 bg-blue-50 p-5">
                      <h2 className="font-semibold text-gray-900">
                        Email của bạn bè:
                      </h2>
                      <input type="text" placeholder="Nhập email bạn bè..." className="border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>

                    {/* Checkbox */}
                    <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-lg border p-4 hover:bg-gray-50">

                      <input
                        type="checkbox"
                        checked={isAgree}
                        onChange={(e) => setIsAgree(e.target.checked)}
                        className="mt-1 h-5 w-5 rounded text-blue-600"
                      />

                      <span className="text-sm text-gray-700">
                        Tôi đã đọc và hiểu rằng chỉ <b>Public Key</b> sẽ được chia sẻ.
                        Tôi đồng ý kết bạn để có thể trao đổi email được mã hóa đầu cuối. Chúng tôi sẽ không chịu trách nhiệm cho hành động này 
                      </span>

                    </label>

                  </div>

                  {/* Footer */}
                  <div className="mt-8 flex justify-end gap-3">

                    <button
                      type="button"
                      onClick={() => {
                        setIsAgree(false);
                        setIsOpen(false);
                      }}
                      className="rounded-lg border border-gray-300 px-5 py-2 text-sm text-gray-700 font-medium hover:bg-gray-200"
                    >
                      Hủy
                    </button>

                    <button
                      type="button"
                      disabled={!isAgree}
                      onClick={() => {
                        alert("Đã xác nhận!");
                        setIsAgree(false);
                        setIsOpen(false);
                      }}
                      className={`rounded-lg px-5 py-2 text-sm font-medium text-white transition
                        ${
                          isAgree
                            ? "bg-blue-600 hover:bg-blue-700"
                            : "cursor-not-allowed bg-gray-300"
                        }`}
                    >
                      Đồng ý
                    </button>

                  </div>

                </DialogPanel>
              </TransitionChild>

            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}