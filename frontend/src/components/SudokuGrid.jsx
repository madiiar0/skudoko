import { useState } from 'react'

import { CANDIDATE_VALUES, getCellCandidates } from '../utils/candidates'
import { isTipCell } from '../utils/tips'

function isRelated(selected, r, c) {
  if (!selected) return false
  const [sr, sc] = selected
  if (sr === r && sc === c) return false
  if (sr === r || sc === c) return true
  return Math.floor(sr / 3) === Math.floor(r / 3) && Math.floor(sc / 3) === Math.floor(c / 3)
}

const C = {
  bgDefault: 'var(--cell-bg)',
  bgLocked: 'var(--cell-locked)',
  bgRelated: 'var(--cell-related)',
  bgSameNum: 'var(--cell-same-num)',
  bgHoverDefault: 'var(--cell-hover)',
  bgHoverRelated: 'var(--cell-hover-related)',
  bgHoverSameNum: 'var(--cell-hover-same-num)',
  bgSelected: 'var(--cell-selected)',
  bgError: 'var(--cell-error)',

  numUser: 'var(--num-user)',
  numLocked: 'var(--num-locked)',
  numTip: 'var(--num-tip)',
  numCandidate: 'var(--num-candidate)',
  numSelected: 'var(--num-selected)',
  numError: 'var(--num-error)',
}

export default function SudokuGrid({ board, locked, candidates = [], tipCells = [], selected, onSelect, error }) {
  const [hovered, setHovered] = useState(null)
  const selectedNum = selected ? board[selected[0]][selected[1]] : 0

  return (
    /*
     * Outer div: orange outer border frame.
     * Inner div: 3×3 box grid — CSS gap with orange background creates thick
     *   3×3 separator lines cleanly, no border doubling.
     * Each box div: 3×3 cell grid — gap with dark blue creates thin cell lines.
     */
    <div
      className="board-size"
      style={{ border: '2px solid var(--grid-outer)', flexShrink: 0 }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gridTemplateRows: 'repeat(3, 1fr)',
          gap: 2,
          background: 'var(--grid-thick)',
          width: '100%',
          height: '100%',
        }}
      >
        {Array.from({ length: 9 }, (_, boxIdx) => {
          const boxRow = Math.floor(boxIdx / 3)
          const boxCol = boxIdx % 3

          return (
            <div
              key={boxIdx}
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gridTemplateRows: 'repeat(3, 1fr)',
                gap: 1,
                background: 'var(--grid-thin)',
              }}
            >
              {Array.from({ length: 9 }, (_, cellIdx) => {
                const cellRow = Math.floor(cellIdx / 3)
                const cellCol = cellIdx % 3
                const r = boxRow * 3 + cellRow
                const c = boxCol * 3 + cellCol
                const val = board[r][c]
                const cellCandidates = val === 0 ? getCellCandidates(candidates, r, c) : []
                const hasCandidates = cellCandidates.length > 0

                const isSelected = !!(selected && selected[0] === r && selected[1] === c)
                const isLocked   = locked[r][c]
                const isTip      = isTipCell(tipCells, r, c)
                const isSameNum  = !!(selectedNum && val === selectedNum && !isSelected)
                const isHov      = !!(hovered && hovered[0] === r && hovered[1] === c)
                const isErr      = !!(error && error[0] === r && error[1] === c)
                const isRel      = isRelated(selected, r, c)

                // Build background — highest priority last (overwrites)
                let bg = C.bgDefault
                if (isLocked)  bg = C.bgLocked
                if (isRel)     bg = C.bgRelated
                if (isSameNum) bg = C.bgSameNum
                if (isHov && !isSelected && !isErr) {
                  if (isSameNum)     bg = C.bgHoverSameNum
                  else if (isRel)    bg = C.bgHoverRelated
                  else               bg = C.bgHoverDefault
                }
                if (isSelected) bg = C.bgSelected
                if (isErr)      bg = C.bgError

                // Text color
                const numColor = isErr
                  ? C.numError
                  : isTip
                  ? C.numTip
                  : isSelected
                  ? C.numSelected
                  : isLocked
                  ? C.numLocked
                  : C.numUser

                // Outline for selected / error — drawn inset so it never overflows
                let outline = 'none'
                if (isSelected) outline = '2px solid var(--accent)'
                if (isErr)      outline = '2px solid var(--error)'

                return (
                  <div
                    key={`${r}-${c}`}
                    onClick={() => onSelect(r, c)}
                    onMouseEnter={() => setHovered([r, c])}
                    onMouseLeave={() => setHovered(null)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: bg,
                      cursor: isLocked || isTip ? 'default' : 'pointer',
                      transition: 'background 0.1s',
                      fontSize: 'clamp(13px, 2vw, 21px)',
                      fontWeight: isLocked ? 700 : 600,
                      color: numColor,
                      userSelect: 'none',
                      outline,
                      outlineOffset: '-2px',
                      position: 'relative',
                      zIndex: isSelected || isErr ? 1 : 0,
                    }}
                  >
                    {val !== 0 ? val : hasCandidates ? (
                      <div
                        style={{
                          width: '82%',
                          height: '82%',
                          display: 'grid',
                          gridTemplateColumns: 'repeat(3, 1fr)',
                          gridTemplateRows: 'repeat(3, 1fr)',
                          alignItems: 'center',
                          justifyItems: 'center',
                          color: isSelected ? 'var(--accent-text)' : C.numCandidate,
                          fontSize: 'clamp(6px, 0.95vw, 10px)',
                          fontWeight: 800,
                          lineHeight: 1,
                          letterSpacing: '-0.02em',
                        }}
                      >
                        {CANDIDATE_VALUES.map(candidate => (
                          <span key={candidate}>
                            {cellCandidates.includes(candidate) ? candidate : ''}
                          </span>
                        ))}
                      </div>
                    ) : ''}
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}
