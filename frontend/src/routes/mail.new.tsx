import { createFileRoute } from '@tanstack/react-router'
import { PencilLine } from 'lucide-react';
import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useSendMail } from '../hooks/useSend';

export const Route = createFileRoute('/mail/new')({
  component: New,
})


function New() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const { sendMail, loadingMail } = useSendMail();
  
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

    console.log("Before axios");
    const result = await sendMail({
      to: formData.to,
      subject: formData.subject,
      content: formData.content,
      files: files,
      
    });
    if (result.success) {
      alert("Gửi email thành công!");

      setFormData({
        to: "",
        subject: "",
        content: "",
      });

      setFiles([]);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
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
      {/* CỘT TRÁI: DANH SÁCH Yeu thich */}
      <div className="w-full md:w-1/3 border-r border-[oklch(0.24_0.01_260)] flex flex-col h-full">
          <div className="p-4 border-b border-[oklch(0.24_0.01_260)] bg-[oklch(0.12_0.01_260)]">
              <div className="relative text-center py-1 px-4">
                  <span className="text-[oklch(0.85_0.01_260)] font-medium tracking-wide">
                  Danh sách yêu thích
                  </span>
              </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-[oklch(0.2_0.01_260)]">
          asdsd
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
                <button
                    type="submit"
                    disabled={loadingMail}
                    className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition disabled:opacity-50"
                >
                    {loadingMail ? "Đang gửi..." : "Gửi"}
                </button>

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