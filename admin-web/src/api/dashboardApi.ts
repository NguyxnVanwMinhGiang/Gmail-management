const API_URL = "http://127.0.0.1:8000/api/admin/dashboard";

function getToken() {
  return localStorage.getItem("accessToken");
}

function getHeaders() {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token ?? ""}`,
  };
}

async function readJson<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return response.json() as Promise<T>;
  }
  return {} as T;
}

export interface DashboardResponse {
  summary: {
    total_users: number;
    total_orders: number;
    growth_rate: number;
    current_month_orders: number;
    previous_month_orders: number;
  };
  monthly: {
    labels: string[];
    visits: number[];
    orders: number[];
  };
}

export async function getDashboard(): Promise<DashboardResponse> {
  const response = await fetch(`${API_URL}/`, {
    method: "GET",
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error("Không thể lấy dữ liệu dashboard");
  }

  return readJson<DashboardResponse>(response);
}
