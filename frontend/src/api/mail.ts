import axios from "axios";

// Định nghĩa kiểu dữ liệu trả về từ Backend tương ứng với Database của bạn
export type EmailItem = {
  id: number;
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

const API_URL = "http://127.0.0.1:8000/api/v1"; // Thay bằng URL Backend của bạn

// METHOD GET
export const asyncGmail = async (limit: number) => {
  const token = localStorage.getItem("accessToken");

  if (!token) {
    throw new Error("Không tìm thấy Access Token. Vui lòng đăng nhập lại.");
  }

  const response = await axios.get(`${API_URL}/gmail/sync-emails`, {
    params: { limit },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.status + "message: success"

}


export const getInbox = async (page: number, limit: number): Promise<EmailItem[]> => {
  // Lấy hệ thống token bạn lưu lúc đăng nhập (ví dụ lưu trong localStorage)
  const token = localStorage.getItem("accessToken");

  if (!token) {
    throw new Error("Không tìm thấy Access Token. Vui lòng đăng nhập lại.");
  }

  const response = await axios.get(`${API_URL}/gmail/inbox`, {
    params: { page, limit },
    headers: {
      Authorization: `Bearer ${token}`, // Truyền JWT token cho auth_middleware ở BE
    },
  });
  // Giả sử Backend trả về object có dạng: { message: "...", data: [...] } hoặc trực tiếp mảng
  return response.data.data || response.data;
};


export const getTrash = async (page: number, limit: number): Promise<EmailItem[]> => {
  // Lấy hệ thống token bạn lưu lúc đăng nhập (ví dụ lưu trong localStorage)
  const token = localStorage.getItem("accessToken");

  if (!token) {
    throw new Error("Không tìm thấy Access Token. Vui lòng đăng nhập lại.");
  }

  const response = await axios.get(`${API_URL}/gmail/deleted`, {
    params: { page, limit },
    headers: {
      Authorization: `Bearer ${token}`, // Truyền JWT token cho auth_middleware ở BE
    },
  });
  // Giả sử Backend trả về object có dạng: { message: "...", data: [...] } hoặc trực tiếp mảng
  return response.data.data || response.data;
};


export const getStarred = async (page: number, limit: number): Promise<EmailItem[]> => {
  // Lấy hệ thống token bạn lưu lúc đăng nhập (ví dụ lưu trong localStorage)
  const token = localStorage.getItem("accessToken");

  if (!token) {
    throw new Error("Không tìm thấy Access Token. Vui lòng đăng nhập lại.");
  }

  const response = await axios.get(`${API_URL}/gmail/starred`, {
    params: { page, limit },
    headers: {
      Authorization: `Bearer ${token}`, // Truyền JWT token cho auth_middleware ở BE
    },
  });
  // Giả sử Backend trả về object có dạng: { message: "...", data: [...] } hoặc trực tiếp mảng
  return response.data.data || response.data;
};

export const getSpams = async (page: number, limit: number): Promise<EmailItem[]> => {
  // Lấy hệ thống token bạn lưu lúc đăng nhập (ví dụ lưu trong localStorage)
  const token = localStorage.getItem("accessToken");

  if (!token) {
    throw new Error("Không tìm thấy Access Token. Vui lòng đăng nhập lại.");
  }

  const response = await axios.get(`${API_URL}/gmail/spam`, {
    params: { page, limit },
    headers: {
      Authorization: `Bearer ${token}`, // Truyền JWT token cho auth_middleware ở BE
    },
  });
  // Giả sử Backend trả về object có dạng: { message: "...", data: [...] } hoặc trực tiếp mảng
  return response.data.data || response.data;
};

export const getSent = async (page: number, limit: number): Promise<EmailItem[]> => {
  // Lấy hệ thống token bạn lưu lúc đăng nhập (ví dụ lưu trong localStorage)
  const token = localStorage.getItem("accessToken");

  if (!token) {
    throw new Error("Không tìm thấy Access Token. Vui lòng đăng nhập lại.");
  }

  const response = await axios.get(`${API_URL}/gmail/sent`, {
    params: { page, limit },
    headers: {
      Authorization: `Bearer ${token}`, // Truyền JWT token cho auth_middleware ở BE
    },
  });
  // Giả sử Backend trả về object có dạng: { message: "...", data: [...] } hoặc trực tiếp mảng
  return response.data.data || response.data;
};

export const getBody = async (message_id: string): Promise<EmailBody> => {
  const token = localStorage.getItem("accessToken");
  console.log("id email: gmail.ts", message_id)
  if (!token) {
    throw new Error("Không tìm thấy Access Token. Vui lòng đăng nhập lại.");
  }

  const response = await axios.get(`${API_URL}/gmail/id/${message_id}`, {
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

  const response = await axios.post(
    `${API_URL}/gmail/id/${message_id}/delete`, {},
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

  const response = await axios.post(
    `${API_URL}/gmail/id/${message_id}/permanently-delete`,
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

export const starredEmail = async (message_id: string, is_starred: boolean) => {
  const token = localStorage.getItem("accessToken");

  if (!token) {
    throw new Error("Không tìm thấy Access Token. Vui lòng đăng nhập lại.");
  }

  const response = await axios.post(
    `${API_URL}/gmail/id/${message_id}/starred`, {},
    {
      params: { is_starred },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  console.log("ok")

  return {
    status: response.status,
  };
};

export const spamEmail = async (message_id: string, is_spam: boolean) => {
  const token = localStorage.getItem("accessToken");

  if (!token) {
    throw new Error("Không tìm thấy Access Token. Vui lòng đăng nhập lại.");
  }

  const response = await axios.post(
    `${API_URL}/gmail/id/${message_id}/spam`, {},
    {
      params: { is_spam },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  console.log("ok")

  return {
    status: response.status,
  };
};
