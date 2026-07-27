import apiClient from "./apiClient";

const FRIEND_API_URL = "http://127.0.0.1:8000/api/v1/friend";

export interface FriendRequestDto {
  friendship_id: number;
  status: string;
  created_at: string;
  sender_domain: string;
}

interface FriendActionResponse {
  success: boolean;
  message: string;
}

const getAuthHeaders = () => {
  const token = localStorage.getItem("accessToken");

  if (!token) {
    throw new Error("Không tìm thấy Access Token. Vui lòng đăng nhập lại.");
  }

  return {
    Authorization: `Bearer ${token}`,
  };
};

export const addFriend = async (friend_domain: string) => {
  const data = new FormData();
  data.append("friend_domain", friend_domain);

  const response = await apiClient.post(
    `${FRIEND_API_URL}/add`,
    data,
    {
      headers: getAuthHeaders(),
    }
  );

  return {
    status: response.status,
  };
};

// listFriendRequest
export const listFriendRequest = async () => {
  const response = await apiClient.get<FriendRequestDto[]>(
    `${FRIEND_API_URL}/list-friend-requests`,
    {
      headers: getAuthHeaders(),
    }
  );

  return {
    status: response.status,
    data: response.data
  };
};

// acpFriend
export const acpFriend = async (friendship_id: number) => {
  const response = await apiClient.put<FriendActionResponse>(
    `${FRIEND_API_URL}/accept`,
    { friendship_id },
    {
      headers: getAuthHeaders(),
    }
  );

  return {
    status: response.status,
    data: response.data,
  };
};

export const rejectFriend = async (friendship_id: number) => {
  const response = await apiClient.delete<FriendActionResponse>(
    `${FRIEND_API_URL}/reject`,
    {
      data: { friendship_id },
      headers: getAuthHeaders(),
    }
  );

  return {
    status: response.status,
    data: response.data,
  };
};

// list
export const listFriend = async () => {
  const response = await apiClient.get<FriendActionResponse>(
    `${FRIEND_API_URL}/list`,
    {
      headers: getAuthHeaders(),
    }
  );

  return {
    status: response.status,
    data: response.data,
  };
};

// Định nghĩa kiểu dữ liệu trả về từ Backend tương ứng với Database của bạn
export type EmailItem = {
  user_id: number;
  provider: string;
  message_id: string;
  email_from?: string | null;
  email_to?: string | null;
  subject?: string | null;
  body_text?: string | null;
  body_html?: string | null;
  snippet?: string | null;
  is_read: boolean;
  is_starred: boolean;
  is_delete: boolean;
  sent_at?: string | null;
  received_at?: string | null;
};

export type EmailBody = {
  body_text: string;
  body_html: string;
}

export type EamilAction = {
  emailID: number
}


export type EmailSend = {
  provider: string;
  message_id: string;
  email_from?: string | null;
  email_to?: string | null;
  subject?: string | null;
  body_text?: string | null;
}

// METHOD GET
export const getInbox = async (friendId: number, page: number, limit: number): Promise<EmailItem[]> => {
  // Lấy hệ thống token bạn lưu lúc đăng nhập (ví dụ lưu trong localStorage)
  const token = localStorage.getItem("accessToken");

  if (!token) {
    throw new Error("Không tìm thấy Access Token. Vui lòng đăng nhập lại.");
  }

  const response = await apiClient.get(`${FRIEND_API_URL}/inbox`, {
    params: { friend_id: friendId, page, limit },
    headers: {
      Authorization: `Bearer ${token}`, // Truyền JWT token cho auth_middleware ở BE
    },
  });
  // Giả sử Backend trả về object có dạng: { message: "...", data: [...] } hoặc trực tiếp mảng
  return response.data.data || response.data;
};


export const getSentMails = async (friendId: number, page: number, limit: number): Promise<EmailItem[]> => {
  const token = localStorage.getItem("accessToken");

  if (!token) {
    throw new Error("Không tìm thấy Access Token. Vui lòng đăng nhập lại.");
  }

  const response = await apiClient.get(`${FRIEND_API_URL}/sent`, {
    params: { friend_id: friendId, page, limit },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data.data || response.data;
};


export const getTrash = async (page: number, limit: number): Promise<EmailItem[]> => {
  // Lấy hệ thống token bạn lưu lúc đăng nhập (ví dụ lưu trong localStorage)
  const token = localStorage.getItem("accessToken");

  if (!token) {
    throw new Error("Không tìm thấy Access Token. Vui lòng đăng nhập lại.");
  }

  const response = await apiClient.get(`${FRIEND_API_URL}/friend/deleted`, {
    params: { page, limit },
    headers: {
      Authorization: `Bearer ${token}`, // Truyền JWT token cho auth_middleware ở BE
    },
  });
  // Giả sử Backend trả về object có dạng: { message: "...", data: [...] } hoặc trực tiếp mảng
  return response.data.data || response.data;
};



export const getBody = async (message_id: string, friendId: number): Promise<EmailBody> => {
  const token = localStorage.getItem("accessToken");
  console.log("id email: gmail.ts", message_id)
  if (!token) {
    throw new Error("Không tìm thấy Access Token. Vui lòng đăng nhập lại.");
  }

  const response = await apiClient.get(`${FRIEND_API_URL}/id/${message_id}`, {
    params: { friend_id: friendId },
    headers: {
      Authorization: `Bearer ${token}`, // Truyền JWT token cho auth_middleware ở BE
    },
  });

  // Giả sử Backend trả về object có dạng: { message: "...", data: [...] } hoặc trực tiếp mảng
  return response.data?.data || response.data;
};


// METHOD POST
export const deleteEamil = async (message_id: string, is_deleted: boolean) => {
  const token = localStorage.getItem("accessToken");

  if (!token) {
    throw new Error("Không tìm thấy Access Token. Vui lòng đăng nhập lại.");
  }

  const response = await apiClient.post(
    `${FRIEND_API_URL}/gmail/id/${message_id}/delete`, {},
    {
      params: { is_deleted },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return {
    "status": response.status
  }
}

export const deleteEamilDB = async (message_id: string) => {
  const token = localStorage.getItem("accessToken");

  if (!token) {
    throw new Error("Không tìm thấy Access Token. Vui lòng đăng nhập lại.");
  }

  const response = await apiClient.post(
    `${FRIEND_API_URL}/gmail/id/${message_id}/permanently-delete`,
    {}, // body rỗng
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return {
    "status": response.status
  }
}

