import { useState } from 'react'

import { isTipCell } from '../utils/tips'

function isRelated(selected, r, c) {
  if (!selected) return false
  const [sr, sc] = selected
  if (sr === r && sc === c) return false
  if (sr === r || sc === c) return true
  return Math.floor(sr / 3) === Math.floor(r / 3) && Math.floor(sc / 3) === Math.floor(c / 3)
}

// ── Cell color constants ──────────────────────────────────────────────────────
// Priority (highest wins): error > selected > hover > same-num > related > locked > default
const C = {
  bgDefault:      '#111B2A', // calm dark midnight blue
  bgLocked:       '#152130', // slightly elevated — given cells feel anchored
  bgRelated:      '#1C2D3E', // blue step-up — "in the selection zone"
  bgSameNum:      '#2A1A00', // dark warm amber — "same number"
  bgHoverDefault: '#1E2D40', // brightened blue for hover on default/locked
  bgHoverRelated: '#233848', // brightened blue for hover on related cells
  bgHoverSameNum: '#382300', // brightened amber for hover on same-num cells
  bgSelected:     '#8C3D00', // strong rich orange — dominant, unmissable
  bgError:        '#3A0F1C', // deep crimson

  numUser:   '#C8D4E8', // cool blue-white for user-entered
  numLocked: '#E8A040', // golden amber for given numbers
  numTip:    '#C8D4E8', // soft green for revealed tip cells
  numSelected: '#FFFFFF', // white — readable on orange bg regardless of locked/user
  numError:  '#FF7090', // bright pink-red on dark red bg
}

export default function SudokuGrid({ board, locked, tipCells = [], selected, onSelect, error }) {
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
      style={{ border: '2px solid #FF7A1A', flexShrink: 0 }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gridTemplateRows: 'repeat(3, 1fr)',
          gap: 2,
          background: '#FF7A1A',
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
                background: '#1E3050',
              }}
            >
              {Array.from({ length: 9 }, (_, cellIdx) => {
                const cellRow = Math.floor(cellIdx / 3)
                const cellCol = cellIdx % 3
                const r = boxRow * 3 + cellRow
                const c = boxCol * 3 + cellCol
                const val = board[r][c]

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
                if (isSelected) outline = '2px solid #FF8C00'
                if (isErr)      outline = '2px solid #FF4D6D'

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
                    {val !== 0 ? val : ''}
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
