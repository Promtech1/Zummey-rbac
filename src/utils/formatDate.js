const dateFormatter = new Intl.DateTimeFormat('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })
const dateTimeFormatter = new Intl.DateTimeFormat('en-NG', {
  day: 'numeric',
  month: 'short',
  hour: 'numeric',
  minute: '2-digit',
})

// formatDate('2026-10-07T09:30:00Z') -> "7 Oct 2026"
export function formatDate(iso) {
  return iso ? dateFormatter.format(new Date(iso)) : '—'
}

// formatDateTime('2026-10-07T09:30:00Z') -> "7 Oct, 10:30 am"
export function formatDateTime(iso) {
  return iso ? dateTimeFormatter.format(new Date(iso)) : '—'
}
