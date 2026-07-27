import axios, { type InternalAxiosRequestConfig, type AxiosResponse, AxiosError } from 'axios';
import { notify } from '../contexts/notificationBridge'

const apiClient = axios.create({
  baseURL: "http://localhost:8000", // Khớp với API_BASE_URL của bạn
  headers: {
    "Content-Type": "application/json",
  },
});

// 1. Tự động đính kèm Token vào mọi request gửi đi
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const token = localStorage.getItem("accessToken");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// 2. Lắng nghe phản hồi từ Backend để xử lý lỗi 401 (Hết hạn / Giả mạo)
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response && error.response.status === 401) {
      const url = error.config?.url || "";

      // BỎ QUA nếu lỗi 401 này đến từ các API Đăng nhập (đăng nhập sai mật khẩu công việc khác)
      if (!url.includes("/api/v1/auth/login") && !url.includes("/api/v1/auth/google-login")) {
        notify("Phiên đăng nhập đã hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại!", 'error');

        // Xóa sạch token cũ
        localStorage.removeItem("accessToken");

        // Đẩy người dùng văng ra trang login lập tức
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
