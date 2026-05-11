export const DEFAULT_DIFFICULTY = 'medium'

export const DIFFICULTY_OPTIONS = [
  { value: 'easy', label: 'Easy', blankCount: 35 },
  { value: 'medium', label: 'Medium', blankCount: 45 },
  { value: 'hard', label: 'Hard', blankCount: 50 },
  { value: 'extreme', label: 'Extreme', blankCount: 60 },
]

const DIFFICULTY_BY_VALUE = new Map(DIFFICULTY_OPTIONS.map(option => [option.value, option]))

export function normalizeDifficulty(value) {
  const normalizedValue = String(value || '').trim().toLowerCase()
  return DIFFICULTY_BY_VALUE.has(normalizedValue) ? normalizedValue : DEFAULT_DIFFICULTY
}

export function getDifficultyLabel(value) {
  return DIFFICULTY_BY_VALUE.get(normalizeDifficulty(value))?.label || 'Medium'
}

export function getDifficultyBlankCount(value) {
  return DIFFICULTY_BY_VALUE.get(normalizeDifficulty(value))?.blankCount || 45
}
