export const INITIAL_TIPS_REMAINING = 3

function normalizeIndex(value) {
  const number = Number(value)
  return Number.isInteger(number) && number >= 0 && number < 9 ? number : null
}

export function normalizeTipCells(tipCells = []) {
  if (!Array.isArray(tipCells)) {
    return []
  }

  const seen = new Set()
  const normalized = []

  tipCells.forEach(cell => {
    const row = normalizeIndex(cell?.row)
    const col = normalizeIndex(cell?.col)

    if (row === null || col === null) {
      return
    }

    const key = `${row}:${col}`
    if (seen.has(key)) {
      return
    }

    seen.add(key)
    normalized.push({ row, col })
  })

  return normalized
}

export function sanitizeTipsRemaining(value) {
  if (value === null || value === undefined || value === '') {
    return INITIAL_TIPS_REMAINING
  }

  return Math.max(0, Math.floor(Number(value) || 0))
}

export function isTipCell(tipCells, row, col) {
  return normalizeTipCells(tipCells).some(cell => cell.row === row && cell.col === col)
}

export function addTipCell(tipCells, row, col) {
  return normalizeTipCells([...normalizeTipCells(tipCells), { row, col }])
}

export function getTipBadge(tipsRemaining) {
  const count = sanitizeTipsRemaining(tipsRemaining)
  return count > 0 ? String(count) : 'Ad'
}
