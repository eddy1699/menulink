const PEN_FORMATTER = new Intl.NumberFormat('es-PE', {
  style: 'currency',
  currency: 'PEN',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export function formatPEN(amount: number | string): string {
  const value = typeof amount === 'string' ? Number(amount) : amount
  return PEN_FORMATTER.format(Number.isFinite(value) ? value : 0)
}
