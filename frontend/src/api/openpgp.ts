// api/pgpService.ts
import * as openpgp from 'openpgp';

export const PGPService = {
  // 1. Tạo cặp khóa (Private key sẽ tự động bị khóa bởi passphrase)
  generateKeys: async (name: string, email: string, passphrase: string) => {
    const { privateKey, publicKey } = await openpgp.generateKey({
      type: 'ecc',
      curve: 'ed25519' as openpgp.EllipticCurveName,      
      userIDs: [{ name, email }],
      passphrase, // Khóa Private Key
      format: 'armored'
    });
    return { publicKey, encryptedPrivateKey: privateKey };
  },

  // 2. Mở khóa Private Key từ Server tải về
  unlockPrivateKey: async (encryptedPrivateKey: string, passphrase: string) => {
    try {
      const privateKeyObj = await openpgp.decryptKey({
        privateKey: await openpgp.readPrivateKey({ armoredKey: encryptedPrivateKey }),
        passphrase
      });
      return privateKeyObj; // Trả về object khóa đã mở
    } catch (error) {
      throw new Error("Sai mật khẩu cấp 2");
    }
  }
};

export async function decryptPGPText(encryptedText: string, privateKeyObj: openpgp.PrivateKey): Promise<string> {
  if (!encryptedText || !encryptedText.includes('BEGIN PGP MESSAGE')) {
    return encryptedText; // Nếu nội dung không bị mã hóa hoặc rỗng thì trả về nguyên bản
  }
  try {
    const message = await openpgp.readMessage({ armoredMessage: encryptedText });
    const { data: decrypted } = await openpgp.decrypt({
      message,
      decryptionKeys: privateKeyObj
    });
    return decrypted as string;
  } catch (error) {
    console.error("Lỗi giải mã trường dữ liệu:", error);
    return "--- Lỗi: Không thể giải mã nội dung này ---";
  }
}

/**
 * Giải mã toàn bộ các trường nội dung của 1 Object Email
 */
export async function decryptEmailObject(email: any, privateKeyObj: openpgp.PrivateKey) {
  const decryptedEmail = { ...email };

  // Chạy giải mã song song các trường để tối ưu hiệu năng
  const [subject, snippet, bodyText, bodyHtml] = await Promise.all([
    decryptPGPText(email.subject, privateKeyObj),
    decryptPGPText(email.snippet, privateKeyObj),
    decryptPGPText(email.body_text, privateKeyObj),
    decryptPGPText(email.body_html, privateKeyObj)
  ]);

  decryptedEmail.subject = subject;
  decryptedEmail.snippet = snippet;
  decryptedEmail.body_text = bodyText;
  decryptedEmail.body_html = bodyHtml;

  return decryptedEmail;
}