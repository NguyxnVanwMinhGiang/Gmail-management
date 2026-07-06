import { createFileRoute } from '@tanstack/react-router'
import { PencilLine } from 'lucide-react';
import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useSendMail } from '../hooks/useSend';
import { useFriendRequests } from '../hooks/friend/useFriend';


export const Route = createFileRoute('/mail/new')({
  component: New,
})


function New() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const { sendMail, loadingMail } = useSendMail();
  const { friends, loadFriendList } = useFriendRequests();
  const [isFriendEmail, setIsFriendEmail] = useState(false);
  // State quản lý form dữ liệu text
  const [formData, setFormData] = useState({
    to: '',
    subject: '',
    content: ''
  });

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleSendMail = async (e: FormEvent) => {
    e.preventDefault();

    const result = await sendMail({
      to: formData.to,
      subject: formData.subject,
      content: formData.content,
      files: files,
      isFriendEmail: isFriendEmail, // Truyền trạng thái công tắc vào hàm
    });

    if (result.success) {
      alert(isFriendEmail ? "Gửi email cho bạn bè thành công!" : "Gửi email thành công!");
      setFormData({ to: "", subject: "", content: "" });
      setFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } else {
      alert("Gửi mail thất bại!");
    }
  };

  const handleFileRemove = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setFiles([]);
  }


  return (
    <div className="flex h-full w-full bg-[oklch(0.16_0.01_260)] text-[oklch(0.7_0.01_260)] flex-col md:flex-row overflow-hidden">
      <div className="w-full md:w-1/3 flex flex-row h-full"> {/* Thay flex-col thành flex-row, có thể chỉnh lại w-2/3 hoặc w-full tùy layout tổng của bạn */}

        <div className="w-1/2 border-r border-[oklch(0.24_0.01_260)] flex flex-col h-full">
          <div className="p-4 border-b border-[oklch(0.24_0.01_260)] bg-[oklch(0.12_0.01_260)]">
            <div className="relative text-center py-1 px-4">
              <span className="text-[oklch(0.85_0.01_260)] font-medium tracking-wide">
                Danh sách bạn bè
              </span>
            </div>
          </div>
          {/* Thêm dữ liệu flex-1 ở đây để vùng này chiếm trọn chiều cao còn lại và có thể cuộn dọc */}
          <div className="flex-1 overflow-y-auto divide-y divide-[oklch(0.2_0.01_260)] p-4">
            {loadFriendList ? (
              // Trạng thái đang tải dữ liệu
              <div className="text-center py-4 text-[oklch(0.6_0.01_260)] text-sm animate-pulse">
                Đang tải danh sách...
              </div>
            ) : friends.length === 0 ? (
              // Trạng thái trống
              <div className="text-center py-8 text-[oklch(0.5_0.01_260)] text-sm">
                Chưa có người bạn nào.
              </div>
            ) : (
              // Render danh sách bạn bè khi có dữ liệu
              friends.map((friend) => (
                <div
                  key={friend.friend_id}
                  className="flex items-center justify-between py-3 px-3 hover:bg-[oklch(0.18_0.01_260)] transition-colors rounded-lg group cursor-pointer border-none"
                >
                  {/* Bên trái: Avatar tự tạo bằng chữ đầu + Thông tin tên/domain */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[oklch(0.24_0.01_260)] flex items-center justify-center text-[oklch(0.85_0.01_260)] font-bold uppercase border border-[oklch(0.3_0.01_260)] group-hover:border-[oklch(0.5_0.01_260)] transition-colors">
                      {friend.domain ? friend.domain[0] : '?'}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[oklch(0.85_0.01_260)] font-medium text-sm group-hover:text-white transition-colors">
                        {friend.domain}
                      </span>
                      <span className="text-[oklch(0.5_0.01_260)] text-xs pt-1">
                        {friend.created_at ? friend.created_at.split(' ')[0] : ''}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* CỘT BÊN PHẢI */}
        <div className="w-1/2 flex flex-col h-full">
          <div className="p-4 border-b border-[oklch(0.24_0.01_260)] bg-[oklch(0.12_0.01_260)]">
            <div className="relative text-center py-1 px-4">
              <span className="text-[oklch(0.85_0.01_260)] font-medium tracking-wide">
                Mô tả thông tin
              </span>
            </div>
          </div>
          {/* Thêm flex-1 tương tự để đồng bộ cuộn độc lập với cột trái */}
          <div className="flex-1 overflow-y-auto divide-y divide-[oklch(0.2_0.01_260)] p-4">

          </div>
        </div>

      </div>

      {/* CỘT PHẢI: NỘI DUNG CHI TIẾT EMAIL */}
      <form onSubmit={handleSendMail} className="flex-1 flex flex-col bg-[oklch(0.14_0.01_260)] min-w-0">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[oklch(0.24_0.01_260)]">
          <div className="flex items-center gap-4">
            <PencilLine className="w-6 h-6 text-white" />
            <h2 className="text-xl font-semibold text-white">
              Soạn Thư
            </h2>
          </div>
        </div>

        {/* Form */}
        <div className="flex-1 flex flex-col p-6 gap-4 overflow-hidden">
          <div className="text-xs text-[oklch(0.5_0.01_260)] mt-0.5">Người gửi: {localStorage.getItem("email")}</div>

          {/* Người nhận */}
          <input
            type="email"
            name="to"
            value={formData.to}
            onChange={handleInputChange}
            required
            placeholder="Người nhận"
            className="w-full rounded-lg bg-[oklch(0.18_0.01_260)] border border-[oklch(0.24_0.01_260)] px-4 py-3 text-white placeholder:text-gray-500 outline-none focus:border-blue-500"
          />

          {/* layout file count */}
          <div className="grid grid-cols-2 gap-4">
            {files.length >= 0 && (
              <div className="text-xs text-gray-400 flex flex-wrap gap-2 items-center">
                <span className="font-semibold text-white">Đính kèm ({files.length}):</span>
                {files.map((f, i) => (
                  <span key={i} className="bg-[oklch(0.2_0.01_260)] text-[oklch(0.85_0.01_260)] text-sm px-2 py-2 rounded max-w-50 truncate">
                    {f.name}
                    <button
                      type="button"
                      onClick={() => handleFileRemove(i)}
                      className="ml-2 text-red-500 hover:text-red-700 cursor-pointer"

                    >
                      x
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Tiêu đề */}
          <input
            type="text"
            name="subject"
            value={formData.subject}
            onChange={handleInputChange}
            required
            placeholder="Tiêu đề"
            className="rounded-lg bg-[oklch(0.18_0.01_260)] border border-[oklch(0.24_0.01_260)] px-4 py-3 text-white placeholder:text-gray-500 outline-none focus:border-blue-500"
          />

          {/* Nội dung */}
          <textarea
            name="content"
            value={formData.content}
            onChange={handleInputChange}
            required
            placeholder="Nhập nội dung email..."
            className="flex-1 resize-none rounded-lg bg-[oklch(0.18_0.01_260)] border border-[oklch(0.24_0.01_260)] p-4 text-white placeholder:text-gray-500 outline-none focus:border-blue-500"
          />


          {/* Footer */}
          <div className="flex justify-between items-center border-t border-[oklch(0.24_0.01_260)] pt-4">
            <div className="flex items-center gap-6">
              <button
                type="submit"
                disabled={loadingMail}
                className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition disabled:opacity-50"
              >
                {loadingMail ? "Đang gửi..." : "Gửi"}
              </button>
              {/* CÔNG TẮC ĐƠN GIẢN (CHECKBOX) */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFriendEmail}
                  onChange={(e) => setIsFriendEmail(e.target.checked)}
                  className="w-5 h-5 rounded bg-[oklch(0.18_0.01_260)] border-[oklch(0.24_0.01_260)] text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-[oklch(0.85_0.01_260)]">
                  Click để gửi cho bạn bè
                </span>
              </label>
            </div>

            <div className="flex gap-3">
              <button type="button" onClick={() => fileInputRef.current?.click()} className="px-4 py-2 rounded-lg bg-[oklch(0.2_0.01_260)] hover:bg-blue-600 text-white">
                📎 Đính kèm
              </button>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                hidden
                onChange={handleFileChange}
              />

              <button type="button" className="px-4 py-2 rounded-lg bg-[oklch(0.2_0.01_260)] hover:bg-blue-600 text-white">
                Yêu thích
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}