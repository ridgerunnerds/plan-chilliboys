export function cleanPhoneForWhatsApp(phone: string): string {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '')
  if (!digits) return ''

  // If it looks like a Mexican number without country code (10 digits, starts with 1, 2, 3, 4, 5, 6, 7, 8, or 9)
  if (digits.length === 10 && !digits.startsWith('52')) {
    return `52${digits}`
  }

  return digits
}

export const GREG_WHATSAPP = '5216121052006'

export function formatWhatsAppMessage(project: {
  title: string
  userName: string
  userEmail: string
  phone?: string
  description: string
  status: string
  quote?: number
}): string {
  const lines = [
    '*Chilli Boys — New Project for Follow Up*',
    '',
    `👤 *Client:* ${project.userName}`,
    `📧 *Email:* ${project.userEmail}`,
  ]

  if (project.phone && project.phone !== '(none)') {
    lines.push(`📱 *Client WhatsApp / Phone:* ${project.phone}`)
  }

  lines.push(
    '',
    `📋 *Project:* ${project.title}`,
    `📊 *Status:* ${project.status.replace('_', ' ')}`,
    ''
  )

  if (project.quote !== undefined) {
    lines.push(`💰 *Quote:* $${project.quote.toLocaleString()} MXN`, '')
  }

  lines.push(
    '📝 *Details:*',
    project.description,
    '',
    '_Sent from Chilli Boys Plan Portal_'
  )

  return lines.join('\n')
}

export function openWhatsApp(phone: string, message: string): void {
  const cleaned = cleanPhoneForWhatsApp(phone)
  const encoded = encodeURIComponent(message)

  if (cleaned) {
    window.open(`https://wa.me/${cleaned}?text=${encoded}`, '_blank')
  } else {
    // Fallback: open WhatsApp Web without a specific number (desktop only)
    window.open(`https://web.whatsapp.com/send?text=${encoded}`, '_blank')
  }
}

export function copyToClipboard(text: string): Promise<boolean> {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text).then(() => true).catch(() => false)
  }
  // Fallback for older browsers
  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.style.position = 'fixed'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)
  textarea.select()
  const success = document.execCommand('copy')
  document.body.removeChild(textarea)
  return Promise.resolve(success)
}
