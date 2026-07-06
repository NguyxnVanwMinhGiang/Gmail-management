import axios from "axios";
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
  const response = await axios.get(`${API_URL}/email-groups`, { headers: authHeaders() });
  return response.data?.data || response.data;
};

export const createEmailGroup = async (payload: { name: string; color: string; description?: string }): Promise<EmailGroup> => {
  const response = await axios.post(`${API_URL}/email-groups`, payload, { headers: authHeaders() });
  return response.data?.data || response.data;
};

export const updateEmailGroup = async (groupId: number, payload: { name: string; color: string; description?: string }): Promise<EmailGroup> => {
  const response = await axios.put(`${API_URL}/email-groups/${groupId}`, payload, { headers: authHeaders() });
  return response.data?.data || response.data;
};

export const deleteEmailGroup = async (groupId: number) => {
  const response = await axios.delete(`${API_URL}/email-groups/${groupId}`, { headers: authHeaders() });
  return response.data?.data || response.data;
};

export const toggleEmailInGroup = async (groupId: number, emailId: number) => {
  const response = await axios.post(`${API_URL}/email-groups/${groupId}/emails`, { email_id: emailId }, { headers: authHeaders() });
  return response.data?.data || response.data;
};

export const removeEmailFromGroup = async (groupId: number, emailId: number) => {
  const response = await axios.delete(`${API_URL}/email-groups/${groupId}/emails/${emailId}`, { headers: authHeaders() });
  return response.data?.data || response.data;
};

export const getGroupEmails = async (groupId: number): Promise<{ group: EmailGroup; items: EmailGroupEmail[] }> => {
  const response = await axios.get(`${API_URL}/email-groups/${groupId}/emails`, { headers: authHeaders() });
  return response.data?.data || response.data;
};
