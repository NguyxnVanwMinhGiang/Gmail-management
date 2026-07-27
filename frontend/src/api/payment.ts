import apiClient from './apiClient';

const API_URL = "/api/v1/payment";

export interface CreatePaymentRequest {
  order_id: string;
  amount: number;
  order_info?: string;
}

export interface CreatePaymentResponse {
  payment_url: string;
}

export interface PaymentStatusResponse {
  order_id: string;
  status: "pending" | "success" | "failed";
  transaction_no: string | null;
  txn_ref: string | null;
}

export const createPayment = async (
  data: CreatePaymentRequest
): Promise<CreatePaymentResponse> => {
  const response = await apiClient.post(`${API_URL}/create`, data);
  return response.data;
};

export const getPaymentStatus = async (): Promise<PaymentStatusResponse> => {
  const response = await apiClient.get(`${API_URL}/status`);
  return response.data;
};
