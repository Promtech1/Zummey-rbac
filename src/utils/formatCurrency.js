const nairaFormatter = new Intl.NumberFormat('en-NG', {
  style: 'currency',
  currency: 'NGN',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

// formatCurrency(1250000) -> "₦1,250,000"
export function formatCurrency(amount) {
  return nairaFormatter.format(Number(amount) || 0)
}

const compactNairaFormatter = new Intl.NumberFormat('en-NG', {
  style: 'currency',
  currency: 'NGN',
  notation: 'compact',
  maximumFractionDigits: 1,
})

// formatCurrencyCompact(1250000) -> "₦1.3M" (for chart axes)
export function formatCurrencyCompact(amount) {
  return compactNairaFormatter.format(Number(amount) || 0)
}
