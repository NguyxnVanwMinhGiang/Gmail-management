const API_URL = "http://127.0.0.1:8000/api/admin";

export interface Admin {
  id: number;
  full_name: string;
  email: string;
  role: string;
  permissions: Record<string, boolean>;
  is_active: boolean;
  is_verified: boolean;
  is_2fa_enabled: boolean;
  created_by: number | null;
  updated_by: number | null;
  created_at: string;
  updated_at: string;
}

export interface CreateAdminRequest {
  email: string;
  password: string;
  full_name: string;
  permissions: Record<string, boolean>;
}

export interface UpdateAdminRequest {
  admin_id: number;
  email?: string;
  full_name?: string;
  permissions?: Record<string, boolean>;
  is_active?: boolean;
  is_verified?: boolean;
}

export interface ChangePasswordRequest {
  admin_id: number;
  password: string;
}

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

export async function getAdmin(): Promise<Admin[]> {
  const response = await fetch(`${API_URL}/action`, {
    method: "GET",
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error("Không thể lấy danh sách admin");
  }

  return readJson<Admin[]>(response);
}

export async function createAdmin(data: CreateAdminRequest): Promise<Admin> {
  const response = await fetch(`${API_URL}/action`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Không thể tạo admin");
  }

  const result = await readJson<{ admin?: Admin } | Admin>(response);
  return (result as { admin?: Admin }).admin ?? (result as Admin);
}

export async function updateAdmin(data: UpdateAdminRequest): Promise<Admin> {
  const response = await fetch(`${API_URL}/action/${data.admin_id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Không update admin");
  }

  const result = await readJson<{ admin?: Admin } | Admin>(response);
  return (result as { admin?: Admin }).admin ?? (result as Admin);
}

export async function deleteAdmin(admin_id: number) {
  const response = await fetch(`${API_URL}/action/${admin_id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error("Không delete admin");
  }

  return readJson<{ message: string }>(response);
}

export async function changePassword(data: ChangePasswordRequest) {
  const response = await fetch(`${API_URL}/action/${data.admin_id}/password`, {
    method: "PATCH",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Không thể thay đổi mật khẩu");
  }

  return readJson<{ message: string }>(response);
}
