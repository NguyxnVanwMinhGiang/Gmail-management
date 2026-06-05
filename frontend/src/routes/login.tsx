import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Mail, Lock, User, X } from "lucide-react";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

async function loginAdmin(email: string, password: string) {
  const response = await fetch(
    "http://127.0.0.1:8080/api/admin/auth/login",
    {
      method: "POST",
      body: JSON.stringify({ email, password }),
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Đăng nhập thất bại");
  }

  return response.json();
}

function LoginPage() {
  const navigate = useNavigate();

  const [error, setError] = useState("");
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

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!isLogin) {
      alert("Chức năng đăng ký sẽ được làm sau.");
      return;
    }

    const formData = new FormData(event.currentTarget);

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const data = await loginAdmin(email, password);

      localStorage.setItem(
        "accessToken",
        data.access_token
      );

      navigate({
        to: "/admin",
      });
    } catch {
      setError("Email hoặc mật khẩu không đúng");
    }
  }

  function openPopup(
    title: string,
    content: string
  ) {
    setPopupTitle(title);
    setPopupContent(content);
    setPopupOpen(true);
  }

  return (
    <div className="min-h-screen bg-black text-white">

      {/* HEADER */}

      <header className="h-16 border-b border-white/10 flex items-center justify-between px-8">

        <div className="font-bold text-xl">
          Email Management
        </div>

        <div className="flex gap-8 text-sm">

          <button
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
            onClick={() =>
              openPopup(
                "Liên hệ",
                "Email: hothaimyhuong296@gmail.com"
              )
            }
          >
            Liên hệ
          </button>

        </div>

      </header>

      {/* POPUP */}

      {popupOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">

          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-zinc-900 p-6">

            <div className="flex items-center justify-between">

              <h3 className="text-xl font-bold">
                {popupTitle}
              </h3>

              <button
                onClick={() => setPopupOpen(false)}
              >
                <X />
              </button>

            </div>

            <p className="mt-4 text-zinc-400">
              {popupContent}
            </p>

          </div>

        </div>
      )}

      <div className="flex min-h-[calc(100vh-64px)]">

        {/* LEFT */}

        <div className="hidden lg:flex w-1/2 relative items-center justify-center border-r border-white/10 bg-gradient-to-br from-black via-zinc-900 to-black">

          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_40%)]" />

          <div className="relative z-10 text-center px-10">

            <img
              src="/logo-no-bg.svg"
              alt="Logo"
              className="w-40 mx-auto mb-8"
            />

            <h1 className="text-5xl font-bold">
              Email
              <span className="text-zinc-400">
                {" "}
                Management
              </span>
            </h1>

            <p className="mt-8 text-zinc-500 text-xl h-16">
              {messages[messageIndex]}
            </p>

          </div>

        </div>

        {/* RIGHT */}

        <div className="flex-1 flex items-center justify-center px-6">

          <div className="w-full max-w-md">

            <div className="mb-5 flex rounded-xl bg-zinc-900 p-1">

              <button
                type="button"
                onClick={() => setIsLogin(true)}
                className={`flex-1 h-11 rounded-lg transition ${
                  isLogin
                    ? "bg-white text-black"
                    : "text-white"
                }`}
              >
                Đăng nhập
              </button>

              <button
                type="button"
                onClick={() => setIsLogin(false)}
                className={`flex-1 h-11 rounded-lg transition ${
                  !isLogin
                    ? "bg-white text-black"
                    : "text-white"
                }`}
              >
                Đăng ký
              </button>

            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">

              <div className="text-center mb-8">

                <h2 className="text-3xl font-bold">
                  {isLogin
                    ? "Đăng nhập"
                    : "Đăng ký"}
                </h2>

                <p className="text-zinc-400 mt-2">
                  {isLogin
                    ? "Chào mừng quay trở lại"
                    : "Tạo tài khoản mới"}
                </p>

              </div>

              <form
                onSubmit={handleSubmit}
                className="space-y-5"
              >

                {!isLogin && (
                  <div>

                    <label className="mb-2 block text-sm text-zinc-300">
                      Họ và tên
                    </label>

                    <div className="flex items-center bg-black/40 border border-white/10 rounded-xl px-4 h-14">

                      <User className="w-5 h-5 text-zinc-500" />

                      <input
                        type="text"
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
                      placeholder="admin@gmail.com"
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
                  <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl p-4">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full h-14 rounded-xl bg-white text-black font-semibold"
                >
                  {isLogin
                    ? "Đăng nhập"
                    : "Tạo tài khoản"}
                </button>

              </form>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Mail, Lock } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

async function loginAdmin(email: string, password: string) {
  const response = await fetch(
    "/auth/login",
    {
      method: "POST",
      body: JSON.stringify({ email, password }),
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Đăng nhập thất bại");
  }

  return response.json();
}

function LoginPage() {
  const navigate = useNavigate();
  const [error, setError] = useState("");

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      await loginAdmin(email, password);

      navigate({
        to: "/",
      });
    } catch {
      setError("Email hoặc mật khẩu không đúng");
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex">

      {/* LEFT SIDE */}
      <div className="hidden lg:flex w-1/2 relative items-center justify-center border-r border-white/10 bg-linear-to-br from-black via-zinc-900 to-black">

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_40%)]" />

        <div className="relative z-10 text-center px-10">
          <img
            src="/logo-no-bg.svg"
            alt="Logo"
            className="w-36 mx-auto mb-8 drop-shadow-2xl"
          />

          <h1 className="text-5xl font-bold tracking-tight leading-tight">
            Email
            <span className="text-zinc-400"> Management</span>
          </h1>

          <p className="mt-6 text-zinc-500 text-lg leading-relaxed">
            Hệ thống quản lý email chuyên nghiệp,
            bảo mật và tối ưu cho doanh nghiệp.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex-1 flex items-center justify-center px-6">

        <div className="w-full max-w-md">

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">

            <div className="text-center mb-8">
              <img
                src="/logo-nbg.svg"
                alt="Logo"
                className="w-20 mx-auto mb-4 lg:hidden"
              />

              <h2 className="text-3xl font-bold">
                Đăng nhập
              </h2>

              <p className="text-zinc-400 mt-2">
                Chào mừng quay trở lại
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* EMAIL */}
              <div>
                <label className="text-sm text-zinc-300 mb-2 block">
                  Email
                </label>

                <div className="flex items-center bg-black/40 border border-white/10 rounded-xl px-4 h-14 focus-within:border-white transition">
                  <Mail className="w-5 h-5 text-zinc-500" />

                  <input
                    name="email"
                    type="email"
                    required
                    placeholder="user@email4u.com"
                    className="bg-transparent outline-none flex-1 ml-3 text-white placeholder:text-zinc-600"
                  />
                </div>
              </div>

              {/* PASSWORD */}
              <div>
                <label className="text-sm text-zinc-300 mb-2 block">
                  Mật khẩu
                </label>

                <div className="flex items-center bg-black/40 border border-white/10 rounded-xl px-4 h-14 focus-within:border-white transition">
                  <Lock className="w-5 h-5 text-zinc-500" />

                  <input
                    name="password"
                    type="password"
                    required
                    placeholder="••••••••"
                    className="bg-transparent outline-none flex-1 ml-3 text-white placeholder:text-zinc-600"
                  />
                </div>
              </div>

              {/* ERROR */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl p-4">
                  {error}
                </div>
              )}

              {/* BUTTON */}
              <button
                type="submit"
                className="w-full h-14 rounded-xl bg-white text-black font-semibold hover:bg-zinc-300 transition-all duration-300"
              >
                Đăng nhập
              </button>

            </form>

            <div className="mt-6 text-center text-zinc-500 text-sm">
              Chưa có tài khoản?{" "}
              <Link
                to="/"
                className="text-white hover:underline"
              >
                Đăng ký
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

