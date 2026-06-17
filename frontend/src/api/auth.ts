const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";
const AUTH_BASE_URL = `${API_BASE_URL.replace(/\/$/, "")}/api/v1/auth`;
const API_GOOGLE_READ = "openid email profile https://www.googleapis.com/auth/gmail.readonly"

type AuthResponse = {
    message?: string;
    accessToken?: string;
    access_token?: string;
    tokenType?: string;
    token_type?: string;
    user?: {
        id: number;
        email: string;
        full_name?: string;
    };
};

// Định nghĩa interface cho dữ liệu trả về từ FastAPI backend của bạn
interface BackendAuthResponse {
  accessToken: string;
  tokenType?: string;
}

async function readApiError(response: Response, fallbackMessage: string) {
    const contentType = response.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
        const errorData = await response.json().catch(() => ({}));

        return errorData.detail || errorData.message || fallbackMessage;
    }

    const text = await response.text().catch(() => "");

    return text.trim() || fallbackMessage;
}

function saveAuthData(data: AuthResponse) {
    const accessToken = data.accessToken || data.access_token;
    const tokenType = data.tokenType || data.token_type || "bearer";

    if (!accessToken) {
        throw new Error("Backend không trả về accessToken");
    }

    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("tokenType", tokenType);

    if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
    }
}

async function requestAuth<T>(path: string, body: Record<string, unknown>, fallbackMessage: string) {
    const response = await fetch(`${AUTH_BASE_URL}${path}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        throw new Error(await readApiError(response, fallbackMessage));
    }

    return response.json() as Promise<T>;
}

async function loginWithEmail(email: string, password: string) {
    return requestAuth<AuthResponse>(
        "/login",
        {
            email,
            password,
        },
        "Email hoặc mật khẩu không đúng",
    );
}

async function registerWithEmail(fullName: string, email: string, password: string) {
    return requestAuth<{ message?: string }>(
        "/register",
        {
            full_name: fullName,
            email,
            password,
        },
        "Đăng ký thất bại",
    );
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
    API_BASE_URL,
    AUTH_BASE_URL,
    API_GOOGLE_READ,
    loginWithEmail,
    registerWithEmail,
    saveAuthData,
    sendCodeForBackend,
    type BackendAuthResponse,
    type AuthResponse,

}