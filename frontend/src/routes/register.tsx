import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/register")({
  component: RegisterPage,
});

function RegisterPage() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-zinc-900 p-8">

        <div className="text-center">
          <img
            src="/logo-no-bg.svg"
            alt="Logo"
            className="mx-auto mb-6 w-24"
          />

          <h1 className="text-3xl font-bold">
            Đăng ký
          </h1>

          <p className="mt-2 text-zinc-400">
            Tạo tài khoản mới
          </p>
        </div>

        <form className="mt-8 space-y-5">

          <div>
            <label className="mb-2 block text-sm text-zinc-300">
              Họ và tên
            </label>

            <input
              type="text"
              placeholder="Nguyễn Văn A"
              className="h-12 w-full rounded-xl border border-white/10 bg-black px-4 outline-none focus:border-white"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-zinc-300">
              Email
            </label>

            <input
              type="email"
              placeholder="example@gmail.com"
              className="h-12 w-full rounded-xl border border-white/10 bg-black px-4 outline-none focus:border-white"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-zinc-300">
              Mật khẩu
            </label>

            <input
              type="password"
              placeholder="••••••••"
              className="h-12 w-full rounded-xl border border-white/10 bg-black px-4 outline-none focus:border-white"
            />
          </div>

          <button
            type="submit"
            className="h-12 w-full rounded-xl bg-white font-semibold text-black transition hover:bg-zinc-300"
          >
            Tạo tài khoản
          </button>

        </form>

        <div className="mt-6 text-center text-sm text-zinc-500">
          Đã có tài khoản?{" "}
          <Link
            to="/login"
            className="text-white hover:underline"
          >
            Đăng nhập
          </Link>
        </div>

      </div>
    </div>
  );
}