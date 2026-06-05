const API_URL = "http://127.0.0.1:8080/api/admin";

export interface Admin {
  id: number;
  full_name: string;
  email: string;
  role: string;
  permissions: Record<string, boolean>;
  is_active: boolean;
  is_verified: boolean;
  is_2fa_enabled: boolean;

  created_by: string;
  updated_by: string;

  created_at: string;
  updated_at: string;
}

export interface CreateAdminRequest {
  email: string;
  password: string;
  full_name: string;
  permissions: Record<string, boolean>;
  is_active: boolean;
  is_verified: boolean;
}

export interface UpdateAdminRequest {
  admin_id: number;
  email: string;
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
    Authorization: `Bearer ${token}`,
  };
}

export async function getAdmin(): Promise<Admin[]> {
  const response = await fetch(`${API_URL}/action`, {
    method: "GET",
    headers: getHeaders()
  });

  if (!response.ok) {
    throw new Error("Không thể lấy danh sách admin");
  }

  return response.json();
}

export async function createAdmin(data: CreateAdminRequest): Promise<Admin> {
  const response = await fetch(`${API_URL}/action`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    throw new Error("Không thể tạo admin")
  }

  return response.json()
}

export async function updateAdmin(data: UpdateAdminRequest): Promise<Admin> {
  const response = await fetch(`${API_URL}/action/${data.admin_id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    throw new Error("Không update admin")
  }
  return response.json()
}

export async function deleteAdmin(admin_id: number) {
  const response = await fetch(`${API_URL}/action/${admin_id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  if (!response.ok) {
    throw new Error("Không delete admin")
  }
  return response.json()
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
  return response.json();
}
