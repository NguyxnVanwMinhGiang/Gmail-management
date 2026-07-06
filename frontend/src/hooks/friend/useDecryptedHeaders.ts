// src/hooks/usePGPMail.ts
import { useState, useEffect, useRef, startTransition } from "react";
import * as openpgp from 'openpgp';
import { decryptPGPText } from "../../api/openpgp";
import { type EmailItem } from "../../api/friends";

type OmitEmailItem = EmailItem & { subject: string; snippet: string; };

export const useDecryptedHeaders = (rawEmails: any[], navigate: any) => {
  const [decryptedHeaders, setDecryptedHeaders] = useState<OmitEmailItem[]>([]);
  const cacheRef = useRef<Map<string, OmitEmailItem>>(new Map());

  useEffect(() => {
    let isCancelled = false;
    const decryptHeaders = async () => {
      if (rawEmails.length === 0) {
        startTransition(() => setDecryptedHeaders([]));
        return;
      }

      const armoredKey = sessionStorage.getItem('unlocked_private_key');
      if (!armoredKey) {
        navigate({ to: "/e2ee" }); // Xử lý điều hướng nếu mất key
        return;
      }

      try {
        const privateKeyObj = await openpgp.readPrivateKey({ armoredKey });
        const updatedList = await Promise.all(
          rawEmails.map(async (email) => {
            const cacheKey = String(email.message_id);
            if (cacheRef.current.has(cacheKey)) return cacheRef.current.get(cacheKey)!;

            const [subject, snippet] = await Promise.all([
              decryptPGPText(email.subject ?? "", privateKeyObj),
              decryptPGPText(email.snippet ?? "", privateKeyObj)
            ]);

            const decryptedEmail = { ...email, subject, snippet };
            cacheRef.current.set(cacheKey, decryptedEmail);
            return decryptedEmail;
          })
        );

        if (!isCancelled) startTransition(() => setDecryptedHeaders(updatedList));
      } catch (err) {
        console.error("Lỗi giải mã danh sách:");
      }
    };

    decryptHeaders();
    return () => { isCancelled = true; };
  }, [rawEmails, navigate]);

  return { decryptedHeaders, setDecryptedHeaders };
};