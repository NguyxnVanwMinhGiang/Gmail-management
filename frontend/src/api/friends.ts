import axios from "axios";

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

  const response = await axios.post(
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
  const response = await axios.get<FriendRequestDto[]>(
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
  const response = await axios.put<FriendActionResponse>(
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
  const response = await axios.delete<FriendActionResponse>(
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
  const response = await axios.get<FriendActionResponse>(
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