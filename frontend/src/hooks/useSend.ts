import { useState } from "react";
import axios from "axios";

interface SendMailParams {
  to: string;
  subject: string;
  content: string;
  files: File[];
}

export function useSendMail() {
  const [loadingMail, setLoading] = useState(false);

  const sendMail = async ({
    to,
    subject,
    content,
    files,
  }: SendMailParams) => {
    setLoading(true);

    try {
        const now = new Date();
        // 1. Tạo chuỗi thời gian 12 ký tự: YYMMDDHHmmss
        const yy = String(now.getFullYear()).slice(-2);
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const dd = String(now.getDate()).padStart(2, '0');
        const hh = String(now.getHours()).padStart(2, '0');
        const min = String(now.getMinutes()).padStart(2, '0');
        const ss = String(now.getSeconds()).padStart(2, '0');
        
        const timeString = `${yy}${mm}${dd}${hh}${min}${ss}`; // 12 ký tự
        // 2. Tạo chuỗi ngẫu nhiên 4 ký tự còn lại để đủ 16 ký tự
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let randomString = '';
        for (let i = 0; i < 4; i++) {
        const randomIndex = Math.floor(Math.random() * chars.length);
        randomString += chars[randomIndex];
        }
        // 3. Trộn ngẫu nhiên chuỗi thời gian và chuỗi random
        const combinedArray = (timeString + randomString).split('');
        
        // Thuật toán xáo trộn Fisher-Yates (đảm bảo trộn đều)
        for (let i = combinedArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [combinedArray[i], combinedArray[j]] = [combinedArray[j], combinedArray[i]];
        }

        const message_id = combinedArray.join('');
        const token = localStorage.getItem("accessToken");
        if (!token) {

            return {
                success: false,
                error: new Error("No authentication token found"),
            };
        }

        const data = new FormData();

        data.append("to", to);
        data.append("subject", subject);
        data.append("content", content);
        data.append("message_id", message_id);

        files.forEach((file) => {
            data.append("file_", file);
        });

        const response = await axios.post(
            `http://127.0.0.1:8000/api/v1/app/send`,
            data,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        return {
            success: true,
            data: response.data,
        };
    } catch (error: any) {
        console.error("Lỗi gửi mail:", error);
        console.log(error);
        console.log(error.response);
        console.log(error.response?.data);

        return {
            success: false,
            error,
      };
    } finally {
        setLoading(false);
    }
  };

  return {
    sendMail,
    loadingMail,
  };
}