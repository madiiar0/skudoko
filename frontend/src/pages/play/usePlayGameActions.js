import { useEffect, useEffectEvent, useState } from 'react'
import toast from 'react-hot-toast'

import {
  saveLocalSession,
  touchSession,
} from '../../utils/gameSessionStorage'
import { DEFAULT_DIFFICULTY, normalizeDifficulty } from '../../utils/difficulty'
import { isBoardFilled, isSudokuAnswerCorrect, validateMove } from '../../utils/sudoku'

function getKeyboardNumber(event) {
  if (/^[1-9]$/.test(event.key)) {
    return Number(event.key)
  }

  if (/^Numpad[1-9]$/.test(event.code)) {
    return Number(event.code.replace('Numpad', ''))
  }

  return null
}

function isTypingTarget(target) {
  if (!(target instanceof Element)) {
    return false
  }

  return !!target.closest('input, textarea, select, [contenteditable="true"], [contenteditable=""]')
}

export function usePlayGameActions({
  session,
  setSession,
  userId,
  routeSessionId,
  viewOnly,
  saveCompletedSession,
  saveCurrentSessionBeforeNewGame,
  startNewSession,
}) {
  const [selected, setSelected] = useState(null)
  const [errorCell, setErrorCell] = useState(null)
  const [isCheckingAnswer, setIsCheckingAnswer] = useState(false)
  const [showNewGameConfirm, setShowNewGameConfirm] = useState(false)
  const [isStartingNewGame, setIsStartingNewGame] = useState(false)
  const [isExploding, setIsExploding] = useState(false)
  const [selectedDifficulty, setSelectedDifficulty] = useState(DEFAULT_DIFFICULTY)

  const hasEditableSelection = !!selected && !session?.locked[selected[0]][selected[1]] && !viewOnly

  useEffect(() => {
    let isActive = true

    Promise.resolve().then(() => {
      if (!isActive) return

      setSelected(null)
      setErrorCell(null)
      setShowNewGameConfirm(false)
      setIsExploding(false)
      setSelectedDifficulty(DEFAULT_DIFFICULTY)
    })

    return () => {
      isActive = false
    }
  }, [routeSessionId, userId])

  useEffect(() => {
    if (errorCell) {
      const t = setTimeout(() => setErrorCell(null), 2400)
      return () => clearTimeout(t)
    }

    return undefined
  }, [errorCell])

  function handleSelect(r, c) {
    setSelected([r, c])
    if (errorCell) {
      setErrorCell(null)
    }
  }

  function handleNumber(num) {
    if (!selected || !session || viewOnly) {
      return
    }

    const [r, c] = selected
    if (session.locked[r][c]) {
      return
    }

    if (!validateMove(session.board, r, c, num)) {
      setErrorCell([r, c])
      return
    }

    setSession(prev => {
      const newBoard = prev.board.map(row => [...row])
      const historyEntry = { r, c, prev: prev.board[r][c], next: num, at: new Date().toISOString() }
      newBoard[r][c] = num

      return touchSession(prev, {
        board: newBoard,
        history: [...prev.history, historyEntry],
      })
    })
    setErrorCell(null)
  }

  const handleKeyboardNumber = useEffectEvent(number => {
    handleNumber(number)
  })

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.ctrlKey || event.metaKey || event.altKey || showNewGameConfirm || isTypingTarget(event.target)) {
        return
      }

      const number = getKeyboardNumber(event)
      if (!number) {
        return
      }

      handleKeyboardNumber(number)
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [showNewGameConfirm])

  function handleRemove() {
    if (!selected || !session || viewOnly) return
    const [r, c] = selected

    if (session.locked[r][c]) {
      return
    }

    if (session.board[r][c] === 0) return

    setSession(prev => {
      const newBoard = prev.board.map(row => [...row])
      newBoard[r][c] = 0

      return touchSession(prev, {
        board: newBoard,
        history: [...prev.history, { r, c, prev: prev.board[r][c], next: 0, at: new Date().toISOString() }],
      })
    })
    setErrorCell(null)
  }

  function handleUndo() {
    if (!session || viewOnly) return

    setSession(prev => {
      if (prev.history.length === 0) return prev

      const history = [...prev.history]
      const last = history.pop()
      const newBoard = prev.board.map(row => [...row])
      newBoard[last.r][last.c] = last.prev

      return touchSession(prev, {
        board: newBoard,
        history,
      })
    })
    setErrorCell(null)
  }

  async function handleCheckAnswer() {
    if (!session || viewOnly || isCheckingAnswer) {
      return
    }

    if (!isBoardFilled(session.board)) {
      toast.error('Complete every cell before checking the answer.')
      return
    }

    if (!isSudokuAnswerCorrect(session)) {
      toast.error('The answer is not correct yet.')
      return
    }

    setIsCheckingAnswer(true)

    const completedSession = touchSession(session, {
      status: 'completed',
      completedAt: new Date().toISOString(),
    })

    saveLocalSession(userId, completedSession, { pendingSync: true })
    setSession(completedSession)
    setSelected(null)
    setErrorCell(null)
    setIsExploding(false)
    window.requestAnimationFrame(() => setIsExploding(true))
    toast.success('Correct answer. Puzzle completed!')

    await saveCompletedSession(completedSession, () => {
      toast.error('Completed locally. It will sync when your connection is available.')
    })
    setIsCheckingAnswer(false)
  }

  function handleNewGame() {
    setSelectedDifficulty(DEFAULT_DIFFICULTY)
    setShowNewGameConfirm(true)
  }

  async function handleConfirmNewGame() {
    if (isStartingNewGame) {
      return
    }

    setIsStartingNewGame(true)
    await saveCurrentSessionBeforeNewGame(session)
    startNewSession(selectedDifficulty)
    setSelected(null)
    setErrorCell(null)
    setShowNewGameConfirm(false)
    setIsStartingNewGame(false)
  }

  function handleCancelNewGame() {
    if (isStartingNewGame) {
      return
    }

    setShowNewGameConfirm(false)
  }

  function handleDifficultyChange(value) {
    setSelectedDifficulty(normalizeDifficulty(value))
  }

  return {
    selected,
    errorCell,
    isCheckingAnswer,
    showNewGameConfirm,
    isStartingNewGame,
    isExploding,
    selectedDifficulty,
    hasEditableSelection,
    handleSelect,
    handleNumber,
    handleRemove,
    handleUndo,
    handleCheckAnswer,
    handleNewGame,
    handleConfirmNewGame,
    handleCancelNewGame,
    handleDifficultyChange,
    stopConfetti: () => setIsExploding(false),
  }
}
