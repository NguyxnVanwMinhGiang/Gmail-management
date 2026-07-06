import { createFileRoute, useNavigate, useParams } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import IframeEmailViewer from '../components/mail/IframeRenderBodyMail'
import { useDecryptedBody } from '../hooks/useDecryptedBody'
import { useDecryptedHeaders } from '../hooks/useDecryptedHeaders'
import { useGroupEmails } from '../hooks/useEmailGroups'

export const Route = createFileRoute('/mail/groups/$groupId')({
  component: GroupPage,
})

// Hàm hỗ trợ tách Domain từ chuỗi email (vd: "User <user@gmail.com>" -> "gmail.com")
const extractDomain = (value?: string | null) => {
  if (!value) return 'Khác'
  
  // Dùng Regex lấy đoạn ký tự nằm trong dấu < > nếu có (VD: <a@gmail.com>)
  const match = value.match(/<([^>]+)>/)
  if (match && match[1]) {
    return match[1].toLowerCase().trim()
  }

  // Nếu không có dấu < >, thử dùng Regex cơ bản tìm email trong chuỗi
  const emailMatch = value.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)
  return emailMatch ? emailMatch[0].toLowerCase().trim() : 'Khác'
}

function GroupPage() {
  const navigate = useNavigate()
  const { groupId } = useParams({ from: '/mail/groups/$groupId' })
  const groupIdNumber = Number(groupId)
  
  // State quản lý Domain và Email được chọn
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null)
  const [selectedMessageId, setSelectedMessageId] = useState<string | number | null>(null)

  const { data, isLoading, error } = useGroupEmails(groupIdNumber)
  const rawEmails = useMemo(() => data?.items?.map((item) => item.email) || [], [data])
  const { decryptedHeaders, setDecryptedHeaders } = useDecryptedHeaders(rawEmails, navigate)

  // Nhóm các header theo Domain
  const domainGroups = useMemo(() => {
    const groups: Record<string, typeof decryptedHeaders> = {}
    decryptedHeaders.forEach((header) => {
      const domain = extractDomain(header.email_from || header.email_to || undefined)
      if (!groups[domain]) groups[domain] = []
      groups[domain].push(header)
    })
    return groups
  }, [decryptedHeaders])

  const domains = Object.keys(domainGroups).sort()
  const emailsInSelectedDomain = selectedDomain ? domainGroups[selectedDomain] : []

  // Tìm header và raw mail hiện tại dựa trên message_id thay vì index
  const currentMailHeader = selectedMessageId
    ? decryptedHeaders.find((h) => h.message_id === selectedMessageId) || null
    : null
    
  const currentRawMail = selectedMessageId
    ? rawEmails.find((r) => r.message_id === selectedMessageId) || null
    : null
    
  const currentMailKey = currentRawMail ? String(currentRawMail.message_id) : null
  const { activeBody, isDecryptingBody } = useDecryptedBody(currentMailKey)

  // Reset state khi đổi group
  useEffect(() => {
    setSelectedDomain(null)
    setSelectedMessageId(null)
    setDecryptedHeaders([])
  }, [groupIdNumber, setDecryptedHeaders])

  // Xử lý khi chọn Domain
  const handleSelectDomain = (domain: string) => {
    setSelectedDomain(domain)
    setSelectedMessageId(null) // Reset email body khi đổi domain
  }

  // Xử lý khi chọn Email Header
  const handleSelectMail = (messageId: string | number) => {
    setSelectedMessageId(messageId)
    setDecryptedHeaders((curr) =>
      curr.map((item) => (item.message_id === messageId ? { ...item, is_read: true } : item))
    )
  }

  return (
    <div> 
      <div className="justify-center flex items-center gap-1 border-b border-[oklch(0.24_0.01_260)] bg-[oklch(0.12_0.01_260)] p-4 text-[oklch(0.85_0.01_260)]">
        <h1 className="text-2xl font-semibold">Nhóm: {data?.group?.name || 'Nhóm'}</h1>
        {data?.group?.description && <p className="text-sm text-[oklch(0.65_0.01_260)]">({data.group.description})</p>}
     </div>
      <div className="flex h-screen w-full flex-col overflow-hidden bg-[oklch(0.16_0.01_260)] text-[oklch(0.7_0.01_260)] lg:flex-row">
        
        {/* --- CỘT 1: DANH SÁCH DOMAIN --- */}
        <div className="flex h-full w-full min-w-0 lg:w-[42%] xl:w-[38%]">
          <div className="flex h-full w-[40%] min-w-62.5 max-w-85 flex-col border-r border-[oklch(0.24_0.01_260)]">
            <div className="border-b border-[oklch(0.24_0.01_260)] bg-[oklch(0.12_0.01_260)] p-4">
              <div className="relative px-4 py-1 text-center">
                <span className="font-medium tracking-wide text-[oklch(0.85_0.01_260)]">Danh sách Domain</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
              {isLoading ? (
                <div className="py-4 text-center text-sm text-[oklch(0.6_0.01_260)] animate-pulse">Đang tải dữ liệu...</div>
              ) : error ? (
                <div className="m-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">Không tải được dữ liệu.</div>
              ) : domains.length === 0 ? (
                <div className="py-4 text-center text-sm text-[oklch(0.5_0.01_260)]">Chưa có dữ liệu</div>
              ) : (
                domains.map((domain) => (
                  <div
                    key={domain}
                    onClick={() => handleSelectDomain(domain)}
                    className={`mb-1 cursor-pointer rounded-lg p-3 transition-colors ${
                      selectedDomain === domain
                        ? 'bg-[oklch(0.28_0.03_255)] text-white shadow-[inset_0_0_0_1px_oklch(0.42_0.04_255)]'
                        : 'hover:bg-[oklch(0.2_0.01_260)]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="min-w-0 flex-1">
                        <div className={`truncate text-sm ${selectedDomain === domain ? 'font-semibold text-white' : 'font-medium'}`}>
                          {domain}
                        </div>
                        <div className="text-xs text-[oklch(0.5_0.01_260)]">
                          {domainGroups[domain].length} email
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* --- CỘT 2: DANH SÁCH EMAIL (HEADER) THEO DOMAIN --- */}
          <div className="flex h-full min-w-[320px] flex-1 flex-col border-r border-[oklch(0.24_0.01_260)]">
            <div className="border-b border-[oklch(0.24_0.01_260)] bg-[oklch(0.12_0.01_260)] p-4">
              <div className="relative px-4 py-1 text-center">
                <span className="font-medium tracking-wide text-[oklch(0.85_0.01_260)]">
                  {selectedDomain ? `Email từ ${selectedDomain}` : 'Chọn một Domain'}
                </span>
              </div>
            </div>

            <div className="flex-1 divide-y divide-[oklch(0.2_0.01_260)] overflow-y-auto">
              {!selectedDomain ? (
                <div className="p-4 text-center text-sm text-[oklch(0.5_0.01_260)]">Vui lòng chọn domain ở cột bên trái.</div>
              ) : emailsInSelectedDomain.length === 0 ? (
                <div className="p-4 text-center text-sm text-[oklch(0.5_0.01_260)]">Không có email nào.</div>
              ) : (
                emailsInSelectedDomain.map((item) => (
                  <div
                    key={item.message_id}
                    onClick={() => handleSelectMail(item.message_id)}
                    className={`cursor-pointer p-3 transition-colors ${
                      selectedMessageId === item.message_id
                        ? item.is_read
                          ? 'bg-[oklch(0.2_0.01_260)] text-white'
                          : 'bg-[oklch(0.28_0.03_255)] text-white shadow-[inset_0_0_0_1px_oklch(0.42_0.04_255)]'
                        : item.is_read
                          ? 'hover:bg-[oklch(0.2_0.01_260)]'
                          : 'bg-[oklch(0.28_0.03_255)] text-white shadow-[inset_0_0_0_1px_oklch(0.42_0.04_255)] hover:bg-[oklch(0.3_0.03_255)]'
                    }`}
                  >
                    <div className="mb-1 flex items-start justify-between">
                      <span className={`truncate pr-2 text-sm ${!item.is_read ? 'font-bold text-white' : ''}`}>
                        {item.email_from?.split('<')[0].trim() || 'Ẩn danh'}
                      </span>
                      <span className="whitespace-nowrap text-xs text-[oklch(0.5_0.01_260)]">
                        {item.received_at ? new Date(item.received_at).toLocaleDateString('vi-VN') : ''}
                      </span>
                    </div>
                    <div className={`mb-1 truncate text-xs ${!item.is_read ? 'font-semibold text-[oklch(0.85_0.02_255)]' : ''}`}>
                      {item.subject || '(Không có tiêu đề)'}
                    </div>
                    <div className="truncate text-xs text-[oklch(0.5_0.01_260)]">{item.snippet}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* --- CỘT 3: NỘI DUNG BODY --- */}
        <div className="flex h-screen min-h-0 w-full min-w-0 flex-1 flex-col bg-[oklch(0.14_0.01_260)]">
          {currentMailHeader ? (
            <div className="flex h-full min-h-0 flex-col overflow-hidden">
              <div className="flex items-center justify-center gap-2 border-b border-[oklch(0.24_0.01_260)] bg-[oklch(0.12_0.01_260)] p-4 text-[oklch(0.85_0.01_260)]">
                Nội dung chi tiết thư
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden p-3 pt-1 pb-0">
                <h1 className="mb-4 text-xl font-bold text-white">Tiêu đề: {currentMailHeader.subject || '(Không có tiêu đề)'}</h1>

                <div className="mb-4 flex justify-between border-b border-[oklch(0.2_0.01_260)] pb-4 text-sm">
                  <div>
                    <div className="flex items-center justify-between gap-7 font-medium text-white">Từ: {currentMailHeader.email_from}</div>
                    <div className="mt-0.5 text-xs text-[oklch(0.5_0.01_260)]">Tới: {currentMailHeader.email_to || 'me'}</div>
                  </div>
                  <div className="text-right text-xs text-[oklch(0.5_0.01_260)]">
                    {currentMailHeader.received_at ? new Date(currentMailHeader.received_at).toLocaleString('vi-VN') : ''}
                  </div>
                </div>

                <div className="email-content mb-8 flex w-full flex-1 flex-col text-sm leading-relaxed text-white">
                  {isDecryptingBody ? (
                    <div className="flex items-center gap-2 text-xs text-[oklch(0.5_0.01_260)] animate-pulse">
                      Đang tải và giải mã nội dung bảo mật bằng khóa cấp 2...
                    </div>
                  ) : activeBody ? (
                    activeBody.html ? (
                      <div className="h-full min-h-125 w-full flex-1 overflow-hidden rounded-lg bg-white">
                        <IframeEmailViewer htmlContent={activeBody.html} />
                      </div>
                    ) : (
                      <p className="whitespace-pre-line">{activeBody.text}</p>
                    )
                  ) : null}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-[oklch(0.5_0.01_260)]">
              {selectedDomain ? 'Chọn một thư để xem nội dung chi tiết' : 'Vui lòng chọn Domain và Thư để xem'}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}