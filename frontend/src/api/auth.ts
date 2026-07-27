import apiClient from "./apiClient";

const API_BASE_URL = "http://localhost:8000";
const API_GOOGLE = "https://mail.google.com/"

type AuthResponse = {
  message?: string;
  accessToken?: string;
  tokenType?: string;
  token_type?: string;
  user?: {
    id: number;
    email: string;
    full_name?: string;
  };
};

export interface UserInfo {
  id: number;
  email: string;
  total_emails: number;
  total_starred: number;
  total_deleted: number;
}


// Định nghĩa interface cho dữ liệu trả về từ FastAPI backend của bạn
interface BackendAuthResponse {
  accessToken: string;
  tokenType?: string;
}

export async function getCurrentUser(token: string): Promise<UserInfo> {
  try {
    const response = await apiClient.get(`${API_BASE_URL}/api/v1/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response || !response.data) {
      throw new Error("Không nhận được phản hồi từ server");
    }

    return response.data;
  } catch (error: any) {
    console.error("Lấy thông tin user thất bại:", error.response?.data || error.message);
    throw error;
  }
}

async function loginWithEmail(email: string, password: string): Promise<AuthResponse> {
  try {
    const response = await apiClient.post(`${API_BASE_URL}/api/v1/auth/login`, {
      email,
      password,
    });

    if (!response || !response.data) {
      throw new Error("No response data received from server");
    }

    return response.data;

  } catch (error: any) {
    console.error("Login failed:", error.response?.data || error.message);
    throw error;
  }
}

async function registerWithEmail(fullName: string, email: string, password: string): Promise<AuthResponse> {
  try {
    const response = await apiClient.post(`${API_BASE_URL}/api/v1/auth/register`, {
      full_name: fullName,
      email,
      password,
    });

    if (!response || !response.data) {
      throw new Error("No response data received from server");
    }

    return response.data;

  } catch (error: any) {
    console.error("Login failed:", error.response?.data || error.message);
    throw error;
  }
}

async function sendCodeForBackend(authorizationCode: string) {
  const response = await fetch("http://localhost:8000/api/v1/auth/google-login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ code: authorizationCode })
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message =
      typeof errorData.detail === "string"
        ? errorData.detail
        : JSON.stringify(errorData.detail || errorData, null, 2);

    throw new Error(message || "Backend trả về lỗi khi xác thực code");
  }
  const data: BackendAuthResponse = await response.json()
  return data;
}

export {
  API_GOOGLE,
  loginWithEmail,
  registerWithEmail,
  sendCodeForBackend,
  type BackendAuthResponse,
  type AuthResponse,

}