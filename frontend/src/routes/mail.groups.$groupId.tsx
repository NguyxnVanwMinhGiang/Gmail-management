import { createFileRoute, useNavigate, useParams } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import { Trash2 } from 'lucide-react'
import IframeEmailViewer from '../components/mail/IframeRenderBodyMail'
import { useDecryptedBody } from '../hooks/useDecryptedBody'
import { useDecryptedHeaders } from '../hooks/useDecryptedHeaders'
import { useGroupEmails, useRemoveEmailFromGroup } from '../hooks/useEmailGroups'

export const Route = createFileRoute('/mail/groups/$groupId')({
  component: GroupPage,
})

const extractDomain = (value?: string | null) => {
  if (!value) return 'Khác'

  const match = value.match(/<([^>]+)>/)
  if (match && match[1]) {
    return match[1].toLowerCase().trim()
  }

  const emailMatch = value.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)
  return emailMatch ? emailMatch[0].toLowerCase().trim() : 'Khác'
}

function GroupPage() {
  const navigate = useNavigate()
  const { groupId } = useParams({ from: '/mail/groups/$groupId' })
  const groupIdNumber = Number(groupId)

  const [selectedDomain, setSelectedDomain] = useState<string | null>(null)
  const [selectedMessageId, setSelectedMessageId] = useState<string | number | null>(null)
  const removeEmailFromGroupMutation = useRemoveEmailFromGroup()

  const { data, isLoading, error } = useGroupEmails(groupIdNumber)
  const rawEmails = useMemo(() => data?.items?.map((item) => item.email) || [], [data])
  const { decryptedHeaders, setDecryptedHeaders } = useDecryptedHeaders(rawEmails, navigate)

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

  const currentMailHeader = selectedMessageId
    ? decryptedHeaders.find((h) => h.message_id === selectedMessageId) || null
    : null

  const currentRawMail = selectedMessageId
    ? rawEmails.find((r) => r.message_id === selectedMessageId) || null
    : null

  const currentMailKey = currentRawMail ? String(currentRawMail.message_id) : null
  const { activeBody, isDecryptingBody } = useDecryptedBody(currentMailKey)

  useEffect(() => {
    setSelectedDomain(null)
    setSelectedMessageId(null)
    setDecryptedHeaders([])
  }, [groupIdNumber, setDecryptedHeaders])

  const handleSelectDomain = (domain: string) => {
    setSelectedDomain(domain)
    setSelectedMessageId(null)
  }

  const handleSelectMail = (messageId: string | number) => {
    setSelectedMessageId(messageId)
    setDecryptedHeaders((curr) =>
      curr.map((item) => (item.message_id === messageId ? { ...item, is_read: true } : item))
    )
  }

  // const handleRemoveEmailFromGroup = async (emailId: number, subject?: string | null) => {
  //   const confirmed = window.confirm(`Xóa email${subject ? ` "${subject}"` : ''} khỏi group này?`)
  //   if (!confirmed) return

  //   await removeEmailFromGroupMutation.mutateAsync({ groupId: groupIdNumber, emailId })

  //   if (currentRawMail?.id === emailId) {
  //     setSelectedMessageId(null)
  //   }
  // }

  // Hàm xử lý xóa toàn bộ Email thuộc Domain ra khỏi Group
  const handleRemoveDomainFromGroup = async (domain: string) => {
    const confirmed = window.confirm(`Bạn có chắc muốn xóa email "${domain}" khỏi nhóm này?`)
    if (!confirmed) return

    // Lấy danh sách các message_id thuộc domain này từ decryptedHeaders
    const headersInDomain = domainGroups[domain] || []
    const messageIdsInDomain = headersInDomain.map(h => h.message_id)

    // Lọc ra các email object tương ứng trong rawEmails để lấy id của email hệ thống
    const emailsToRemove = rawEmails.filter(r => messageIdsInDomain.includes(r.message_id))

    // Thực hiện xóa tuần tự hoặc song song (ở đây chạy vòng lặp mutateAsync)
    for (const email of emailsToRemove) {
      await removeEmailFromGroupMutation.mutateAsync({ groupId: groupIdNumber, emailId: email.id })
    }

    // Nếu domain đang chọn bị xóa, clear trạng thái hiện tại
    if (selectedDomain === domain) {
      setSelectedDomain(null)
      setSelectedMessageId(null)
    }
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
                domains.map((domain) => {
                  return (
                    <div
                      key={domain}
                      onClick={() => handleSelectDomain(domain)}
                      className={`group/item mb-1 cursor-pointer rounded-lg p-3 transition-colors ${selectedDomain === domain
                          ? 'bg-[oklch(0.28_0.03_255)] text-white shadow-[inset_0_0_0_1px_oklch(0.42_0.04_255)]'
                          : 'hover:bg-[oklch(0.2_0.01_260)]'
                        }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className={`truncate text-sm ${selectedDomain === domain ? 'font-semibold text-white' : 'font-medium'}`}>
                            {domain}
                          </div>
                          <div className="text-xs text-[oklch(0.5_0.01_260)]">
                            {domainGroups[domain].length} email
                          </div>
                        </div>

                        {/* Nút xóa toàn bộ domain (Chỉ hiển thị khi hover vào hàng đó) */}
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation() // Chặn sự kiện click nhảy vào chọn domain
                            void handleRemoveDomainFromGroup(domain)
                          }}
                          disabled={removeEmailFromGroupMutation.isPending}
                          className="rounded p-1 text-[oklch(0.62_0.01_260)] opacity-0 transition hover:bg-red-500/10 hover:text-red-300 group-hover/item:opacity-100 disabled:cursor-not-allowed disabled:opacity-40"
                          title={`Xóa tất cả email từ ${domain}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  )
                })
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
                emailsInSelectedDomain.map((item) => {
                  // Tìm bản ghi email tương ứng để lấy database ID giao tiếp với backend mutation xóa lẻ
                  // const emailRecord = rawEmails.find((record) => record.message_id === item.message_id)

                  return (
                    <div
                      key={item.message_id}
                      onClick={() => handleSelectMail(item.message_id)}
                      className={`group cursor-pointer p-3 transition-colors ${selectedMessageId === item.message_id
                          ? item.is_read
                            ? 'bg-[oklch(0.2_0.01_260)] text-white'
                            : 'bg-[oklch(0.28_0.03_255)] text-white shadow-[inset_0_0_0_1px_oklch(0.42_0.04_255)]'
                          : item.is_read
                            ? 'hover:bg-[oklch(0.2_0.01_260)]'
                            : 'bg-[oklch(0.28_0.03_255)] text-white shadow-[inset_0_0_0_1px_oklch(0.42_0.04_255)] hover:bg-[oklch(0.3_0.03_255)]'
                        }`}
                    >
                      <div className="mb-1 flex items-start justify-between gap-2">
                        <span className={`truncate pr-2 text-sm ${!item.is_read ? 'font-bold text-white' : ''}`}>
                          {item.email_from?.split('<')[0].trim() || 'Ẩn danh'}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="whitespace-nowrap text-xs text-[oklch(0.5_0.01_260)]">
                            {item.received_at ? new Date(item.received_at).toLocaleDateString('vi-VN') : ''}
                          </span>
                          
                          {/* Đưa nút xóa email đơn lẻ sang đúng Cột 2 (Danh sách Email) */}
                          {/* {emailRecord && (
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation()
                                void handleRemoveEmailFromGroup(emailRecord.id, item.subject)
                              }}
                              disabled={removeEmailFromGroupMutation.isPending}
                              className="rounded p-1 text-[oklch(0.62_0.01_260)] opacity-0 transition hover:bg-red-500/10 hover:text-red-300 group-hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-40"
                              aria-label="Xóa email khỏi group"
                              title="Xóa khỏi group"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )} */}
                        </div>
                      </div>
                      <div className={`mb-1 truncate text-xs ${!item.is_read ? 'font-semibold text-[oklch(0.85_0.02_255)]' : ''}`}>
                        {item.subject || '(Không có tiêu đề)'}
                      </div>
                      <div className="truncate text-xs text-[oklch(0.5_0.01_260)]">{item.snippet}</div>
                    </div>
                  )
                })
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