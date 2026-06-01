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
  full_name?: string;
  permissions?: Record<string, boolean>;
  is_active?: boolean;
  is_verified?: boolean;
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

export async function getAdmin(): Promise<Admin[]>  {
    const response = await fetch(`${API_URL}/action`,{
        method: "GET",
        headers: getHeaders()
    });

    if (!response.ok) {
        throw new Error("Không thể lấy danh sách admin");
    }

    return response.json();
}

// export async function getAdmin() {
//     const response = await fetch(`${API_URL}`,{
//         method: "GET",
//         headers: getHeaders()
//     });

//     if (!response.ok) {
//         throw new Error("Không thể lấy danh sách admin");
//     }

//     return response.json();
// }

// export async function getAdmin() {
//     const response = await fetch(`${API_URL}`,{
//         method: "GET",
//         headers: getHeaders()
//     });

//     if (!response.ok) {
//         throw new Error("Không thể lấy danh sách admin");
//     }

//     return response.json();
// }


[
    {
        "full_name": "Nguyễn Văn Minh Giang",
        "email": "admin7046@mail4u.admin",
        "role": "admin",
        "permissions": {
            "log": true,
            "data": true,
            "sale": true,
            "management": true
        },
        "is_active": true,
        "failed_login_attempts": 0,
        "last_login": null,
        "created_by": null,
        "created_at": "2026-05-24T11:50:17.453318",
        "password_hash": "$2b$12$SXFMLcqv1oMy4szG48Hqpu4oIyQS5YgJkzC.cZuzhEDNLC7N4.iB2",
        "id": 1,
        "is_verified": false,
        "is_2fa_enabled": false,
        "locked_until": null,
        "password_changed_at": "2026-05-24T11:50:17.453318",
        "updated_by": null,
        "updated_at": "2026-05-24T11:50:17.453318"
    }
]