export const DEFAULT_DIFFICULTY = 'medium'

export const DIFFICULTY_OPTIONS = [
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
  { value: 'extreme', label: 'Extreme' },
]

const DIFFICULTY_BY_VALUE = new Map(DIFFICULTY_OPTIONS.map(option => [option.value, option]))

export function normalizeDifficulty(value) {
  const normalizedValue = String(value || '').trim().toLowerCase()
  return DIFFICULTY_BY_VALUE.has(normalizedValue) ? normalizedValue : DEFAULT_DIFFICULTY
}

export function getDifficultyLabel(value) {
  return DIFFICULTY_BY_VALUE.get(normalizeDifficulty(value))?.label || 'Medium'
}

export function getSudokuGenDifficulty(value) {
  const difficulty = normalizeDifficulty(value)
  return difficulty === 'extreme' ? 'expert' : difficulty
}
