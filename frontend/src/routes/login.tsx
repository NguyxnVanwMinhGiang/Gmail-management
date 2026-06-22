import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useGoogleLogin } from '@react-oauth/google';
import { Mail, Lock, User, X } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { loginWithEmail, registerWithEmail, saveAuthData, sendCodeForBackend, API_GOOGLE} from "../api/auth";


export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);


  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLogin, setIsLogin] = useState(true);

  const [popupTitle, setPopupTitle] = useState("");
  const [popupContent, setPopupContent] = useState("");
  const [popupOpen, setPopupOpen] = useState(false);

  const messages = [
    "Quản lý email doanh nghiệp chuyên nghiệp",
    "Bảo mật và phân quyền người dùng",
    "Tích hợp Gmail nhanh chóng và hiệu quả",
  ];

  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setError("");
    setSuccessMessage("");
  }, [isLogin]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccessMessage("");

    const formData = new FormData(event.currentTarget);
    const fullName = String(formData.get("full_name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "").trim();

    try {
      if (isLogin) {
        const data = await loginWithEmail(email, password);
        saveAuthData(data);
        navigate({ to: "/e2ee" });
        return;
      }

      if (!fullName) {
        setError("Vui lòng nhập họ và tên");
        return;
      }

      await registerWithEmail(fullName, email, password);
      setSuccessMessage("Đăng ký tài khoản thành công! Vui lòng đăng nhập.");
      setIsLogin(true);
    } catch (err: any) {
      setError(err.message || "Có lỗi xảy ra, vui lòng thử lại");
    }
  }

  const handleLoginSuccess = async (tokenResponse: Omit<import('@react-oauth/google').CodeResponse, "error" | "error_description" | "error_uri">) => {
    if ('code' in tokenResponse && tokenResponse.code) {
      const authorizationCode: string = tokenResponse.code;
      console.log("Mã code nhận được từ Google:", authorizationCode);
      setLoading(true);
      try {
        const data = await sendCodeForBackend(authorizationCode);
        saveAuthData(data);
        navigate({ to: "/e2ee" });
        return;

      } catch (error: any) {
        console.error("Lỗi đăng nhập:", error);
        alert(error.message || "Có lỗi xảy ra trong quá trình xử lý đăng nhập.");
      } finally {
        setLoading(false);
      }
    } else {
      alert("Không nhận được mã xác thực (Code) hợp lệ từ Google.");
    }
  };

  const login = useGoogleLogin({
    flow: 'auth-code',
    scope: API_GOOGLE,
    onSuccess: handleLoginSuccess,
    onError: (errorResponse) => {
      console.error("Google Login Error:", errorResponse);
      alert("Đăng nhập Google thất bại.");
    }
  });

  function openPopup(title: string, content: string) {
    setPopupTitle(title);
    setPopupContent(content);
    setPopupOpen(true);
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="h-16 border-b border-white/10 flex items-center justify-between px-8">
        <div className="font-bold text-xl">Email Management</div>

        <div className="flex gap-8 text-sm">
          <button
            type="button"
            onClick={() =>
              openPopup(
                "Giới thiệu",
                "Email Management là hệ thống quản lý email doanh nghiệp hiện đại, bảo mật và dễ sử dụng."
              )
            }
          >
            Giới thiệu
          </button>

          <button
            type="button"
            onClick={() =>
              openPopup(
                "Tính năng",
                "Quản lý email, phân quyền người dùng, tích hợp Gmail và gửi email nhanh chóng."
              )
            }
          >
            Tính năng
          </button>

          <button
            type="button"
            onClick={() =>
              openPopup("Liên hệ", "Email: hothaimyhuong296@gmail.com")
            }
          >
            Liên hệ
          </button>
        </div>
      </header>

      {popupOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-zinc-900 p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold">{popupTitle}</h3>
              <button type="button" onClick={() => setPopupOpen(false)}>
                <X />
              </button>
            </div>
            <p className="mt-4 text-zinc-400">{popupContent}</p>
          </div>
        </div>
      )}

      <div className="flex min-h-[calc(100vh-64px)]">
        <div className="hidden lg:flex w-1/2 relative items-center justify-center border-r border-white/10 bg-linear-to-br from-black via-zinc-900 to-black">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_40%)]" />

          <div className="relative z-10 text-center px-10">
            <img
              src="/logo-no-bg.svg"
              alt="Logo"
              className="w-40 mx-auto mb-8"
            />

            <h1 className="text-5xl font-bold">
              Email <span className="text-zinc-400">Management</span>
            </h1>

            <p className="mt-8 text-zinc-500 text-xl h-16">
              {messages[messageIndex]}
            </p>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center px-6">
          <div className="w-full max-w-md">
            <div className="mb-5 flex rounded-xl bg-zinc-900 p-1">
              <button
                type="button"
                onClick={() => setIsLogin(true)}
                className={`flex-1 h-11 rounded-lg transition ${isLogin ? "bg-white text-black" : "text-white"
                  }`}
              >
                Đăng nhập
              </button>

              <button
                type="button"
                onClick={() => setIsLogin(false)}
                className={`flex-1 h-11 rounded-lg transition ${!isLogin ? "bg-white text-black" : "text-white"
                  }`}
              >
                Đăng ký
              </button>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold">
                  {isLogin ? "Đăng nhập" : "Đăng ký"}
                </h2>

                <p className="text-zinc-400 mt-2">
                  {isLogin
                    ? "Đăng nhập bằng tài khoản hệ thống hoặc Google"
                    : "Tạo tài khoản hệ thống mới"}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {!isLogin && (
                  <div>
                    <label className="mb-2 block text-sm text-zinc-300">
                      Họ và tên
                    </label>

                    <div className="flex items-center bg-black/40 border border-white/10 rounded-xl px-4 h-14">
                      <User className="w-5 h-5 text-zinc-500" />

                      <input
                        name="full_name"
                        type="text"
                        required={!isLogin}
                        placeholder="Nguyễn Văn A"
                        className="bg-transparent outline-none flex-1 ml-3"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="mb-2 block text-sm text-zinc-300">
                    Email
                  </label>

                  <div className="flex items-center bg-black/40 border border-white/10 rounded-xl px-4 h-14">
                    <Mail className="w-5 h-5 text-zinc-500" />

                    <input
                      name="email"
                      type="email"
                      required
                      placeholder={isLogin ? "user@email.foryou" : "ten-ban@email.foryou"}
                      className="bg-transparent outline-none flex-1 ml-3"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm text-zinc-300">
                    Mật khẩu
                  </label>

                  <div className="flex items-center bg-black/40 border border-white/10 rounded-xl px-4 h-14">
                    <Lock className="w-5 h-5 text-zinc-500" />

                    <input
                      name="password"
                      type="password"
                      required
                      placeholder="••••••••"
                      className="bg-transparent outline-none flex-1 ml-3"
                    />
                  </div>
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl p-4 text-sm">
                    {error}
                  </div>
                )}

                {successMessage && (
                  <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl p-4 text-sm">
                    {successMessage}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full h-14 rounded-xl bg-white text-black font-semibold cursor-pointer hover:bg-zinc-200 transition"
                >
                  {isLogin ? "Đăng nhập bằng email" : "Tạo tài khoản"}
                </button>
              </form>

              {isLogin && (
                <>
                  <div className="flex items-center my-4">
                    <div className="grow border-t border-white/10" />
                    <span className="mx-4 text-zinc-500 text-sm font-medium uppercase">
                      Hoặc
                    </span>
                    <div className="grow border-t border-white/10" />
                  </div>

                  <div className="w-full text-sm">
                    <button
                      onClick={() => login()}
                      disabled={loading}
                      className="flex items-center justify-center gap-3 w-full h-14 cursor-pointer rounded-xl border border-zinc-200 bg-white text-black font-semibold hover:bg-zinc-100 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none"
                    >
                      {loading ? (
                        <span>Đang xử lý...</span>
                      ) : (
                        <>
                          <svg className="h-5 w-5 shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M3.06364 7.50914C4.70909 4.24092 8.09084 2 12 2C14.6954 2 16.959 2.99095 18.6909 4.60455L15.8227 7.47274C14.7864 6.48185 13.4681 5.97727 12 5.97727C9.39542 5.97727 7.19084 7.73637 6.40455 10.1C6.2045 10.7 6.09086 11.3409 6.09086 12C6.09086 12.6591 6.2045 13.3 6.40455 13.9C7.19084 16.2636 9.39542 18.0227 12 18.0227C13.3454 18.0227 14.4909 17.6682 15.3864 17.0682C16.4454 16.3591 17.15 15.3 17.3818 14.05H12V10.1818H21.4181C21.5364 10.8363 21.6 11.5182 21.6 12.2273C21.6 15.2727 20.5091 17.8363 18.6181 19.5773C16.9636 21.1046 14.7 22 12 22C8.09084 22 4.70909 19.7591 3.06364 16.4909C2.38638 15.1409 2 13.6136 2 12C2 10.3864 2.38638 8.85911 3.06364 7.50914Z"></path>
                          </svg>
                          <span>Đăng nhập bằng Google</span>
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
