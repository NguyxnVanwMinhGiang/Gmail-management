import axios from "axios";

// Chỉ giữ lại domain gốc
const API_BASE_URL = "http://127.0.0.1:8000";

type AuthAdminResponse = {
  email: string
  password: string
}

async function loginWithEmail(email: string, password: string): Promise<AuthAdminResponse> {
  try {
    // Giữ nguyên đoạn gọi axios này
    const response = await axios.post(`${API_BASE_URL}/api/admin/auth/login`, {
      email,
      password,
    });

    if (!response || !response.data) {
      throw new Error("No response data received from server");
    }
    localStorage.setItem("accessToken", response.data.accessToken);
    return response.data;

  } catch (error: any) {
    console.error("Login failed:", error.response?.data || error.message);
    throw error;
  }
}

export { loginWithEmail };