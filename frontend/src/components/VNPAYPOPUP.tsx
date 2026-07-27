import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import { Fragment } from 'react';
import { useNotification } from '../contexts/notification';
import { createPayment } from '../api/payment';

type VNPAYPOPUPProps = {
    isOpen: boolean;
    onClose: () => void;
    setIsLoading: (value: boolean) => void;
    onPaymentCreated?: (orderId: string) => void;
};

export default function VNPAYPOPUP({ isOpen, onClose, setIsLoading, onPaymentCreated}: VNPAYPOPUPProps) {
    const { error: notifyError } = useNotification();

    const handleCheckout = async () => {
        setIsLoading(true);
        try {
            // Gọi API Backend để khởi tạo link thanh toán VNPAY
            const orderId = `DH_${Date.now()}`;

            const data = await createPayment({
                order_id: orderId,
                amount: 99000,
                order_info: 'Thanh toán gói Premium'
            });

            if (data.payment_url) {
                onPaymentCreated?.(orderId);
                // Chuyển hướng trình duyệt của người dùng sang cổng thanh toán VNPAY
                window.location.href = data.payment_url;
            } else {
                notifyError('Không lấy được link thanh toán từ hệ thống.');
            }
        } catch (error) {
            console.error('Lỗi khi gọi API thanh toán:', error);
            notifyError('Có lỗi kết nối hệ thống, vui lòng thử lại sau.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Transition show={isOpen}  as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>

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
                            <DialogPanel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white shadow-2xl border border-gray-200">

                                {/* Banner */}
                                <div className="bg-linear-to-r from-blue-600 to-indigo-600 p-8 text-white">
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 text-4xl">
                                            🚀
                                        </div>

                                        <div>
                                            <DialogTitle className="text-2xl font-bold">
                                                Mở khóa Không gian làm việc
                                            </DialogTitle>

                                            <p className="mt-2 text-blue-100">
                                                Làm việc hiệu quả hơn cùng đội nhóm với các tính năng Premium.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Body */}
                                <div className="p-7">

                                    <div className="grid grid-cols-2 gap-4">

                                        <div className="rounded-xl border bg-slate-50 p-4">
                                            <div className="text-2xl">👥</div>
                                            <h3 className="mt-2 font-semibold text-gray-900">
                                                Workspace riêng
                                            </h3>
                                            <p className="mt-1 text-sm text-gray-500">
                                                Tạo nhiều không gian làm việc cho từng dự án hoặc doanh nghiệp.
                                            </p>
                                        </div>

                                        <div className="rounded-xl border bg-slate-50 p-4">
                                            <div className="text-2xl">📂</div>
                                            <h3 className="mt-2 font-semibold text-gray-900">
                                                Chia sẻ thư mục
                                            </h3>
                                            <p className="mt-1 text-sm text-gray-500">
                                                Chia sẻ email và dữ liệu với các thành viên trong nhóm.
                                            </p>
                                        </div>

                                        <div className="rounded-xl border bg-slate-50 p-4">
                                            <div className="text-2xl">🔒</div>
                                            <h3 className="mt-2 font-semibold text-gray-900">
                                                Phân quyền
                                            </h3>
                                            <p className="mt-1 text-sm text-gray-500">
                                                Quản lý quyền truy cập của từng thành viên trong Workspace.
                                            </p>
                                        </div>

                                        <div className="rounded-xl border bg-slate-50 p-4">
                                            <div className="text-2xl">☁️</div>
                                            <h3 className="mt-2 font-semibold text-gray-900">
                                                Dung lượng lớn
                                            </h3>
                                            <p className="mt-1 text-sm text-gray-500">
                                                Lưu trữ nhiều email và tệp đính kèm hơn.
                                            </p>
                                        </div>

                                    </div>

                                    {/* Giá */}
                                    <div className="mt-8 rounded-2xl border border-blue-200 bg-blue-50 p-6">

                                        <p className="text-sm font-semibold text-blue-700 uppercase">
                                            Premium
                                        </p>

                                        <div className="mt-2 flex items-end gap-2">
                                            <span className="text-4xl font-bold text-gray-900">
                                                99.000đ
                                            </span>

                                            <span className="pb-1 text-gray-500">
                                                / tháng
                                            </span>
                                        </div>

                                        <ul className="mt-5 space-y-3 text-sm">

                                            <li className="flex gap-3 text-black">
                                                <span className="text-blue-600">✓</span>
                                                Workspace không giới hạn
                                            </li>

                                            <li className="flex gap-3 text-black">
                                                <span className="text-blue-600">✓</span>
                                                Quản lý thành viên
                                            </li>

                                            <li className="flex gap-3 text-black">
                                                <span className="text-blue-600">✓</span>
                                                Email doanh nghiệp
                                            </li>

                                            <li className="flex gap-3 text-black">
                                                <span className="text-blue-600">✓</span>
                                                Ưu tiên hỗ trợ kỹ thuật
                                            </li>

                                        </ul>

                                    </div>

                                </div>

                                {/* Footer */}
                                <div className="flex justify-end gap-3 border-t bg-gray-50 p-5 text-black">

                                    <button
                                        onClick={onClose}
                                        className="rounded-lg border px-5 py-2 hover:bg-gray-100"
                                    >
                                        Để sau
                                    </button>

                                    <button
                                        onClick={() => {
                                            handleCheckout();
                                        }}
                                        className="rounded-lg bg-linear-to-r from-blue-600 to-indigo-600 px-6 py-2 font-semibold text-white hover:opacity-90"
                                    >
                                        🚀 Nâng cấp ngay
                                    </button>

                                </div>

                            </DialogPanel>
                        </TransitionChild>

                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
