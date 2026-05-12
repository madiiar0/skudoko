import { useEffect, useEffectEvent, useState } from 'react'
import toast from 'react-hot-toast'

import {
  saveLocalSession,
  touchSession,
} from '../../utils/gameSessionStorage'
import { DEFAULT_DIFFICULTY, normalizeDifficulty } from '../../utils/difficulty'
import { isBoardFilled, isSudokuAnswerCorrect, validateMove } from '../../utils/sudoku'
import { addTipCell, getTipBadge, isTipCell, sanitizeTipsRemaining } from '../../utils/tips'
import { clearCellCandidates, getCellCandidates, toggleCandidate } from '../../utils/candidates'
import { useAuth } from '../../hooks/useAuth'

const INPUT_MODES = {
  NORMAL: 'normal',
  CANDIDATE: 'candidate',
}

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

function isCorrectSolutionValue(value) {
  return Number.isInteger(value) && value >= 1 && value <= 9
}

function isCellLocked(session, row, col) {
  return !!session?.locked?.[row]?.[col] || isTipCell(session?.tipCells, row, col)
}

function getEligibleTipCells(session) {
  if (!session || session.status === 'completed') {
    return []
  }

  const cells = []

  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (
        session.board?.[row]?.[col] === 0
        && !session.locked?.[row]?.[col]
        && !isTipCell(session.tipCells, row, col)
        && isCorrectSolutionValue(session.solution?.[row]?.[col])
      ) {
        cells.push({ row, col })
      }
    }
  }

  return cells
}

function chooseRandomCell(cells) {
  return cells[Math.floor(Math.random() * cells.length)]
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
  touchSessionState = touchSession,
  saveSessionLocally = (updatedSession, options) => saveLocalSession(userId, updatedSession, options),
}) {
  const { user } = useAuth()
  const isPro = !!user?.isPro
  const [selected, setSelected] = useState(null)
  const [errorCell, setErrorCell] = useState(null)
  const [isCheckingAnswer, setIsCheckingAnswer] = useState(false)
  const [showNewGameConfirm, setShowNewGameConfirm] = useState(false)
  const [isStartingNewGame, setIsStartingNewGame] = useState(false)
  const [isExploding, setIsExploding] = useState(false)
  const [showTipAd, setShowTipAd] = useState(false)
  const [selectedDifficulty, setSelectedDifficulty] = useState(DEFAULT_DIFFICULTY)
  const [inputMode, setInputMode] = useState(INPUT_MODES.NORMAL)

  const hasEditableSelection = !!selected && !isCellLocked(session, selected[0], selected[1]) && !viewOnly
  const tipBadge = isPro ? 'infinity' : getTipBadge(session?.tipsRemaining)

  useEffect(() => {
    let isActive = true

    Promise.resolve().then(() => {
      if (!isActive) return

      setSelected(null)
      setErrorCell(null)
      setShowNewGameConfirm(false)
      setShowTipAd(false)
      setIsExploding(false)
      setSelectedDifficulty(DEFAULT_DIFFICULTY)
      setInputMode(INPUT_MODES.NORMAL)
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

  useEffect(() => {
    let isActive = true

    if (isPro) {
      Promise.resolve().then(() => {
        if (isActive) {
          setShowTipAd(false)
        }
      })
    }

    return () => {
      isActive = false
    }
  }, [isPro])

  function handleSelect(r, c) {
    setSelected([r, c])
    if (errorCell) {
      setErrorCell(null)
    }
  }

  function handleCandidateNumber(num) {
    if (!selected || !session || viewOnly) {
      return
    }

    const [r, c] = selected
    if (isCellLocked(session, r, c) || session.board[r][c] !== 0) {
      return
    }

    setSession(prev => {
      if (!prev) {
        return prev
      }

      const updatedSession = touchSessionState(prev, {
        candidates: toggleCandidate(prev.candidates, r, c, num),
      })
      saveSessionLocally(updatedSession, { pendingSync: true })
      return updatedSession
    })
    setErrorCell(null)
  }

  function handleNumber(num) {
    if (inputMode === INPUT_MODES.CANDIDATE) {
      handleCandidateNumber(num)
      return
    }

    if (!selected || !session || viewOnly) {
      return
    }

    const [r, c] = selected
    if (isCellLocked(session, r, c)) {
      return
    }

    if (!validateMove(session.solution, r, c, num)) {
      setErrorCell([r, c])
      setSession(prev => (
        prev
          ? touchSessionState(prev, { mistakeCount: (prev.mistakeCount || 0) + 1 })
          : prev
      ))
      return
    }

    setSession(prev => {
      const newBoard = prev.board.map(row => [...row])
      const historyEntry = { r, c, prev: prev.board[r][c], next: num, at: new Date().toISOString() }
      newBoard[r][c] = num

      return touchSessionState(prev, {
        board: newBoard,
        candidates: clearCellCandidates(prev.candidates, r, c),
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
      if (event.ctrlKey || event.metaKey || event.altKey || showNewGameConfirm || showTipAd || isTypingTarget(event.target)) {
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
  }, [showNewGameConfirm, showTipAd])

  function handleRemove() {
    if (!selected || !session || viewOnly) return
    const [r, c] = selected

    if (isCellLocked(session, r, c)) {
      return
    }

    if (session.board[r][c] === 0) {
      if (getCellCandidates(session.candidates, r, c).length === 0) {
        return
      }

      setSession(prev => {
        if (!prev) {
          return prev
        }

        const updatedSession = touchSessionState(prev, {
          candidates: clearCellCandidates(prev.candidates, r, c),
        })
        saveSessionLocally(updatedSession, { pendingSync: true })
        return updatedSession
      })
      setErrorCell(null)
      return
    }

    setSession(prev => {
      const newBoard = prev.board.map(row => [...row])
      newBoard[r][c] = 0

      return touchSessionState(prev, {
        board: newBoard,
        candidates: clearCellCandidates(prev.candidates, r, c),
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
      let last = history.pop()

      while (last && isTipCell(prev.tipCells, last.r, last.c)) {
        last = history.pop()
      }

      if (!last) {
        return history.length === prev.history.length ? prev : touchSessionState(prev, { history })
      }

      const newBoard = prev.board.map(row => [...row])
      newBoard[last.r][last.c] = last.prev

      return touchSessionState(prev, {
        board: newBoard,
        candidates: clearCellCandidates(prev.candidates, last.r, last.c),
        history,
      })
    })
    setErrorCell(null)
  }

  function revealTip(nextTipsRemaining) {
    if (!session || viewOnly) {
      return false
    }

    const eligibleCells = getEligibleTipCells(session)
    if (eligibleCells.length === 0) {
      toast.error('No empty cells are available for a tip.')
      return false
    }

    const tipCell = chooseRandomCell(eligibleCells)
    const nextBoard = session.board.map(row => [...row])
    nextBoard[tipCell.row][tipCell.col] = session.solution[tipCell.row][tipCell.col]

    setSession(prev => (
      prev?.sessionId === session.sessionId
        ? touchSessionState(prev, {
            board: nextBoard,
            tipCells: addTipCell(prev.tipCells, tipCell.row, tipCell.col),
            tipsRemaining: nextTipsRemaining,
            tipsUsed: (prev.tipsUsed || 0) + 1,
            candidates: clearCellCandidates(prev.candidates, tipCell.row, tipCell.col),
          })
        : prev
    ))
    setErrorCell(null)
    return true
  }

  function handleTip() {
    if (!session || viewOnly) {
      return
    }

    if (getEligibleTipCells(session).length === 0) {
      toast.error('No empty cells are available for a tip.')
      return
    }

    if (isPro) {
      revealTip(sanitizeTipsRemaining(session.tipsRemaining))
      return
    }

    const tipsRemaining = sanitizeTipsRemaining(session.tipsRemaining)
    if (tipsRemaining <= 0) {
      setShowTipAd(true)
      return
    }

    revealTip(tipsRemaining - 1)
  }

  function handleCloseTipAd() {
    setShowTipAd(false)
    revealTip(2)
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

    const completedSession = touchSessionState(session, {
      status: 'completed',
      completedAt: new Date().toISOString(),
    })

    saveSessionLocally(completedSession, { pendingSync: true })
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

  function handleInputModeChange(mode) {
    setInputMode(mode === INPUT_MODES.CANDIDATE ? INPUT_MODES.CANDIDATE : INPUT_MODES.NORMAL)
  }

  return {
    selected,
    errorCell,
    isCheckingAnswer,
    showNewGameConfirm,
    showTipAd: !isPro && showTipAd,
    isStartingNewGame,
    isExploding,
    selectedDifficulty,
    inputMode,
    tipBadge,
    hasEditableSelection,
    handleSelect,
    handleNumber,
    handleRemove,
    handleTip,
    handleUndo,
    handleCheckAnswer,
    handleNewGame,
    handleConfirmNewGame,
    handleCancelNewGame,
    handleCloseTipAd,
    handleDifficultyChange,
    handleInputModeChange,
    stopConfetti: () => setIsExploding(false),
  }
}
