import React, { useEffect } from "react";

type AlertType = "success" | "error" | "warning" | "info";

interface AlertProps {
  isOpen?: boolean;
  open?: boolean;
  type?: AlertType;
  severity?: AlertType;
  message?: string;
  onClose: () => void;
  duration?: number;
  children?: React.ReactNode;
}

export default function Alert({
  isOpen,
  open,
  type,
  severity,
  message,
  onClose,
  duration = 3000,
  children,
}: AlertProps) {
  const visible = open ?? isOpen ?? false;
  const variant = severity ?? type ?? "info";
  const content = children ?? message ?? "";

  useEffect(() => {
    if (visible && duration) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [visible, duration, onClose]);

  if (!visible) return null;

  const styles = {
    success: "bg-green-100 border-green-500 text-green-700",
    error: "bg-red-100 border-red-500 text-red-700",
    warning: "bg-yellow-100 border-yellow-500 text-yellow-700",
    info: "bg-blue-100 border-blue-500 text-blue-700",
  };

  return (
    <div className={`fixed top-5 right-5 z-50 flex items-center p-4 border-l-4 rounded shadow-lg ${styles[variant]}`}>
      <span className="flex-1 mr-4">{content}</span>
      <button onClick={onClose} className="font-bold hover:opacity-75">
        ✕
      </button>
    </div>
  );
}
