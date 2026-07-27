const API_URL = "http://127.0.0.1:8000/api/admin/users";
const GOOGLE_API_URL = "http://127.0.0.1:8000/api/admin/users-gg";

export interface GoogleUserItem {
  id: number;
  google_id: string | null;
  full_name: string | null;
  email: string;
  role: string;
  is_active: boolean;
  vip: boolean;
  created_at: string | null;
  updated_at: string | null;
}

export interface UserItem {
  id: number;
  full_name: string;
  email: string;
  role: string;
  is_active: boolean;
  vip: boolean;
  created_at: string | null;
  updated_at: string | null;
  user_gg?: GoogleUserItem | null;
}

export interface GoogleUserItem {
  id: number;
  google_id: string | null;
  full_name: string | null;
  email: string;
  role: string;
  is_active: boolean;
  vip: boolean;
  created_at: string | null;
  updated_at: string | null;
}



export interface UserStatusPayload {
  is_active?: boolean;
  vip?: boolean;
}

function getToken(): string | null {
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

export async function getUsers(): Promise<UserItem[]> {
  const response = await fetch(`${API_URL}/`, {
    method: "GET",
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error("Không thể lấy danh sách user");
  }

  return readJson<UserItem[]>(response);
}

export async function updateUserStatus(userId: number, data: UserStatusPayload): Promise<UserItem> {
  const response = await fetch(`${API_URL}/${userId}`, {
    method: "PATCH",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Không thể cập nhật user");
  }

  return readJson<UserItem>(response);
}

export async function getGoogleUsers(): Promise<GoogleUserItem[]> {
  const response = await fetch(`${GOOGLE_API_URL}/`, {
    method: "GET",
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error("Không thể lấy danh sách Google user");
  }

  return readJson<GoogleUserItem[]>(response);
}

export async function updateGoogleUsersStatus(userId: number, data: UserStatusPayload): Promise<GoogleUserItem> {
  const response = await fetch(`${GOOGLE_API_URL}/${userId}`, {
    method: "PATCH",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Không thể cập nhật user");
  }

  return readJson<GoogleUserItem>(response);
}