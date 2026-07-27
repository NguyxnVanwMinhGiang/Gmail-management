import apiClient from "./apiClient";
import type { EmailItem } from "./mail";

const API_URL = "http://127.0.0.1:8000/api/v1";

export type EmailGroup = {
  id: number;
  user_id: number;
  name: string;
  color: string;
  description?: string | null;
  created_at: string;
  updated_at: string;
};

export type EmailGroupEmail = {
  group_item_id: number;
  email: EmailItem;
};

const authHeaders = () => {
  const token = localStorage.getItem("accessToken");
  if (!token) {
    throw new Error("Không tìm thấy Access Token. Vui lòng đăng nhập lại.");
  }
  return { Authorization: `Bearer ${token}` };
};

export const listEmailGroups = async (): Promise<EmailGroup[]> => {
  const response = await apiClient.get(`${API_URL}/email-groups`, { headers: authHeaders() });
  return response.data?.data || response.data;
};

export const createEmailGroup = async (payload: { name: string; color: string; description?: string }): Promise<EmailGroup> => {
  const response = await apiClient.post(`${API_URL}/email-groups`, payload, { headers: authHeaders() });
  return response.data?.data || response.data;
};

export const updateEmailGroup = async (groupId: number, payload: { name: string; color: string; description?: string }): Promise<EmailGroup> => {
  const response = await apiClient.put(`${API_URL}/email-groups/${groupId}`, payload, { headers: authHeaders() });
  return response.data?.data || response.data;
};

export const deleteEmailGroup = async (groupId: number) => {
  const response = await apiClient.delete(`${API_URL}/email-groups/${groupId}`, { headers: authHeaders() });
  return response.data?.data || response.data;
};

export const toggleEmailInGroup = async (groupId: number, emailId: number) => {
  const response = await apiClient.post(`${API_URL}/email-groups/${groupId}/emails`, { email_id: emailId }, { headers: authHeaders() });
  return response.data?.data || response.data;
};

export const removeEmailFromGroup = async (groupId: number, emailId: number) => {
  const response = await apiClient.delete(`${API_URL}/email-groups/${groupId}/emails/${emailId}`, { headers: authHeaders() });
  return response.data?.data || response.data;
};

export const getGroupEmails = async (groupId: number): Promise<{ group: EmailGroup; items: EmailGroupEmail[] }> => {
  const response = await apiClient.get(`${API_URL}/email-groups/${groupId}/emails`, { headers: authHeaders() });
  return response.data?.data || response.data;
};

export const getGroupMemberships = async (emailId: number): Promise<number[]> => {
  const response = await apiClient.get(`${API_URL}/email-groups/memberships`, {
    params: { email_id: emailId },
    headers: authHeaders(),
  });
  // backend returns { group_ids: [...] }
  return response.data?.group_ids || response.data || [];
};
