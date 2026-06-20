import axios from "axios";

// Định nghĩa kiểu dữ liệu trả về từ Backend tương ứng với Database của bạn
export type EmailItem = {
  id: number;
  user_id: number;
  provider: string;
  gmail_message_id: string;
  gmail_thread_id?: string | null;
  email_from?: string | null;
  email_to?: string | null;
  subject?: string | null;
  body_text?: string | null;
  body_html?: string | null;
  snippet?: string | null;
  is_read: boolean;
  is_starred: boolean;
  sent_at?: string | null;
  received_at?: string | null;
};

const API_URL = "http://127.0.0.1:8000/api/v1"; // Thay bằng URL Backend của bạn

export const getInbox = async (page: number = 1, limit: number = 30): Promise<EmailItem[]> => {
  // Lấy hệ thống token bạn lưu lúc đăng nhập (ví dụ lưu trong localStorage)
  const token = localStorage.getItem("accessToken");

  if (!token) {
    throw new Error("Không tìm thấy Access Token. Vui lòng đăng nhập lại.");
  }

  const response = await axios.get(`${API_URL}/gmail/sync-emails`, {
    params: { page, limit },
    headers: {
      Authorization: `Bearer ${token}`, // Truyền JWT token cho auth_middleware ở BE
    },
  });

  // Giả sử Backend trả về object có dạng: { message: "...", data: [...] } hoặc trực tiếp mảng
  return response.data.data || response.data;
};