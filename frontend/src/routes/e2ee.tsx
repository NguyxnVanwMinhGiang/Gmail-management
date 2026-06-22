// routes/e2ee-setup.tsx (Ví dụ Component xác thực)
import { useState, useEffect } from 'react';
import { useNavigate, createFileRoute } from '@tanstack/react-router';
import { PGPService } from "../api/openpgp"; // Đảm bảo đường dẫn đúng tới file openpgp.ts
// Import thư viện lưu state toàn cục của bạn (như Zustand/Redux) nếu có.
// Hoặc lưu tạm vào sessionStorage: sessionStorage.setItem('decryptedKey', ...)

export const Route = createFileRoute("/e2ee")({
  component: E2EESetup,
});

function E2EESetup() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [hasKeys, setHasKeys] = useState(false);
  const [encryptedKeyFromServer, setEncryptedKeyFromServer] = useState("");
  const [passphrase, setPassphrase] = useState("");
  const [error, setError] = useState("");

  const token = localStorage.getItem("accessToken");

  // 1. Kiểm tra xem user đã có khóa trên Server chưa
  useEffect(() => {
    if (!token) {
      setError("Không tìm thấy access token. Vui lòng đăng nhập lại.");
      setLoading(false);
      return;
    }

    fetch("http://localhost:8000/api/v1/auth/e2ee-keys", {
      headers: { "Authorization": `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setHasKeys(data.has_keys);
        if (data.has_keys) {
          setEncryptedKeyFromServer(data.encrypted_private_key);
        }
        setLoading(false);
      });
  }, [token]);

  // 2. Xử lý tạo khóa mới (Tài khoản mới đăng nhập lần đầu)
  const handleCreateKeys = async () => {
    if (passphrase.length < 6) return setError("Mật khẩu cấp 2 phải có ít nhất 6 ký tự!");
    setLoading(true);
    try {
      // Gọi generate (sẽ mất vài giây vì mã hóa tốn CPU)
      const { publicKey, encryptedPrivateKey } = await PGPService.generateKeys("User", "user@email.com", passphrase);

      // Gửi lên server
      await fetch("http://localhost:8000/api/v1/auth/e2ee-keys", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          public_key: publicKey,
          encrypted_private_key: encryptedPrivateKey
        })
      });

      // Mở khóa luôn cho phiên hiện tại
      const unlockedKey = await PGPService.unlockPrivateKey(encryptedPrivateKey, passphrase);
      sessionStorage.setItem('unlocked_private_key', unlockedKey.armor()); // Lưu tạm vào Session

      navigate({ to: "/mail/inbox" }); // Vào hòm thư
    } catch (e) {
      setError("Lỗi khởi tạo khóa");
    }
    setLoading(false);
  };

  // 3. Xử lý mở khóa (Tài khoản đăng nhập trên máy mới)
  const handleUnlock = async () => {
    setLoading(true);
    try {
      // Dùng passphrase user vừa nhập để mở khóa encrypted_private_key tải từ server
      const unlockedKey = await PGPService.unlockPrivateKey(encryptedKeyFromServer, passphrase);

      // Thành công! Lưu chìa khóa đã mở vào RAM hoặc Session (để dùng giải mã email)
      sessionStorage.setItem('unlocked_private_key', unlockedKey.armor());
      navigate({ to: "/mail/inbox" }); // Vào hòm thư
    } catch (e) {
      setError("Sai mật khẩu cấp 2! Vui lòng thử lại.");
    }
    setLoading(false);
  };

  if (loading) return <div>Đang tải hệ thống bảo mật...</div>;

  return (
    <div className="p-8 max-w-md mx-auto border rounded shadow-md mt-10 text-center">
      <h2 className="text-2xl font-bold mb-4">Bảo Mật Hộp Thư E2EE</h2>

      {!hasKeys ? (
        <>
          <p className="mb-4 text-gray-600">
            Đây là lần đầu bạn đăng nhập. Vui lòng tạo <b>Mật khẩu cấp 2</b> để mã hóa email.
            <br /><span className="text-red-500 text-sm">Cảnh báo: Nếu quên mật khẩu này, bạn sẽ vĩnh viễn mất quyền đọc email cũ!</span>
          </p>
          <input
            type="password" placeholder="Nhập Mật khẩu cấp 2 mới..."
            value={passphrase} onChange={e => setPassphrase(e.target.value)}
            className="border p-2 w-full mb-4"
          />
          <button onClick={handleCreateKeys} className="bg-blue-600 text-white p-2 rounded w-full">Tạo Khóa E2EE</button>
        </>
      ) : (
        <>
          <p className="mb-4 text-gray-600">Hộp thư của bạn đã được khóa an toàn. Vui lòng nhập <b>Mật khẩu cấp 2</b> để mở khóa hộp thư trên thiết bị này.</p>
          <input
            type="password" placeholder="Nhập Mật khẩu cấp 2..."
            value={passphrase} onChange={e => setPassphrase(e.target.value)}
            className="border p-2 w-full mb-4"
          />
          <button onClick={handleUnlock} className="bg-green-600 text-white p-2 rounded w-full">Mở Khóa Hộp Thư</button>
        </>
      )}

      {error && <p className="text-red-500 mt-4">{error}</p>}
    </div>
  );
}