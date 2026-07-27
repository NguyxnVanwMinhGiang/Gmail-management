import { useEffect, useState } from "react";
import { getPaymentStatus } from "../api/payment"; // sửa lại đường dẫn
import VNPAYPOPUP from "./VNPAYPOPUP";

type PaymentStatus = "pending" | "success" | "failed" | null;

const VNPAYCheckoutButton = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await getPaymentStatus();
        console.log("Trạng thái thanh toán:", res.status);
        setPaymentStatus(res.status);
      } catch (err) {
        console.error("Lỗi lấy trạng thái thanh toán:", err);
      } finally {
        setLoadingStatus(false);
      }
    };

    fetchStatus();
  }, []);

  const buttonDisabled =
    loadingStatus ||
    isLoading ||
    paymentStatus === "success" ||
    paymentStatus === "pending";

  const buttonText = () => {
    if (loadingStatus) return "Đang kiểm tra...";

    switch (paymentStatus) {
      case "success":
        return "✅ Bạn đã là hội viên";
      case "pending":
        return "⏳ Đang chờ xử lý";
      default:
        return isLoading ? "Đang chuyển hướng..." : "🚀 Nâng cấp tài khoản ngay";
    }
  };

  return (
    <>
      <button
        onClick={() => {
          if (!buttonDisabled) {
            setIsOpen(true);
          }
        }}
        disabled={buttonDisabled}
        className={`flex w-full items-center justify-center gap-2 rounded-lg px-6 py-3 font-semibold text-white shadow-md transition duration-200
          ${
            paymentStatus === "success"
              ? "bg-green-600"
              : paymentStatus === "pending"
              ? "bg-yellow-500"
              : "bg-blue-600 hover:bg-blue-700"
          }
          disabled:cursor-not-allowed disabled:opacity-70`}
      >
        {isLoading && paymentStatus !== "success" && paymentStatus !== "pending" ? (
          <>
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
            Đang chuyển hướng...
          </>
        ) : (
          buttonText()
        )}
      </button>

      <VNPAYPOPUP
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        setIsLoading={setIsLoading}
      />
    </>
  );
};

export default VNPAYCheckoutButton;