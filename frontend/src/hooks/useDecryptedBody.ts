import { useState, useEffect, useRef, startTransition } from "react";
import * as openpgp from 'openpgp';
import { getBody } from "../api/gmail";
import { decryptPGPText } from "../api/openpgp";

export const useDecryptedBody = (currentMailKey: string | null) => {
  // 1. Khởi tạo State và Cache
  const [activeBody, setActiveBody] = useState<{ html: string; text: string } | null>(null);
  const [isDecryptingBody, setIsDecryptingBody] = useState<boolean>(false);
  const decryptedBodyCacheRef = useRef<Map<string, { html: string; text: string }>>(new Map());

  // 2. Logic gọi API và giải mã
  useEffect(() => {
    let isCancelled = false;

    const fetchAndDecryptBody = async () => {
      // Nếu không có key (chưa chọn thư), reset state
      if (!currentMailKey) {
        startTransition(() => setActiveBody(null));
        return;
      }

      const armoredKey = sessionStorage.getItem('unlocked_private_key');
      if (!armoredKey) return;

      // Kiểm tra cache trước, nếu có thì dùng luôn để tránh gọi lại API
      const cachedBody = decryptedBodyCacheRef.current.get(currentMailKey);
      if (cachedBody) {
        startTransition(() => setActiveBody(cachedBody));
        return;
      }

      setIsDecryptingBody(true);
      try {
        const emailId = String(currentMailKey);

        // Gọi API lấy raw body từ server
        const rawBodyData = await getBody(emailId);

        if (!rawBodyData) {
          throw new Error("Không lấy được dữ liệu chi tiết thư");
        }

        const rawHTML: string = rawBodyData.body_html || "";
        const rawText: string = rawBodyData.body_text || "";

        // Giải mã PGP
        const privateKeyObj = await openpgp.readPrivateKey({ armoredKey });

        const [bodyHtml, bodyText] = await Promise.all([
          decryptPGPText(rawHTML, privateKeyObj),
          decryptPGPText(rawText, privateKeyObj)
        ]);

        const decryptedBody = {
          html: bodyHtml,
          text: bodyText
        };

        // Lưu vào cache
        decryptedBodyCacheRef.current.set(currentMailKey, decryptedBody);

        // Cập nhật State an toàn
        if (!isCancelled) {
          startTransition(() => setActiveBody(decryptedBody));
        }
      } catch (err) {
        console.error("Lỗi khi tải/giải mã nội dung chi tiết thư:", err);
        if (!isCancelled) {
          startTransition(() => setActiveBody({
            html: "",
            text: "--- Lỗi: Không thể tải hoặc giải mã nội dung chi tiết thư ---"
          }));
        }
      } finally {
        if (!isCancelled) {
          setIsDecryptingBody(false);
        }
      }
    };

    fetchAndDecryptBody();

    // Dọn dẹp effect
    return () => {
      isCancelled = true;
    };
  }, [currentMailKey]);

  // 3. Trả về dữ liệu để Component có thể sử dụng
  return { 
    activeBody, 
    isDecryptingBody 
  };
};