export const blogs = [
  {
    slug: 'how-to-play-sudoku',
    title: 'How to Play Sudoku',
    excerpt: 'Learn the goal of Sudoku, how rows, columns, and 3x3 boxes work, and how notes help beginners solve cleanly...',
    fakeViews: 13,
    isProOnly: false,
    callout: 'Sudoku is not guessing. Good Sudoku is solved by eliminating impossible numbers.',
    ruleBlock: [
      'Row: digits 1-9 once',
      'Column: digits 1-9 once',
      'Box: digits 1-9 once',
    ],
    tip: 'Start with the most crowded rows, columns, and boxes. More given numbers means fewer possibilities.',
    sections: [
      {
        heading: 'The goal of Sudoku',
        body: 'Fill every empty cell so the finished board contains the digits 1 through 9 in every row, every column, and every 3x3 box.',
        bullets: ['Every cell gets one number.', 'A completed board has no repeated digit in any row, column, or box.', 'You solve by narrowing possibilities, not by guessing.'],
      },
      {
        heading: 'Rows, columns, and 3x3 boxes',
        body: 'A Sudoku board has nine horizontal rows, nine vertical columns, and nine smaller 3x3 boxes. Each unit must contain 1-9 exactly once.',
        bullets: ['Rows run left to right.', 'Columns run top to bottom.', 'Boxes are the thick-bordered 3x3 regions.'],
      },
      {
        heading: 'How to fill numbers',
        body: 'Pick an empty cell and ask which numbers are still possible. If only one number can fit, place it.',
        bullets: ['Check the row first.', 'Check the column next.', 'Check the 3x3 box last.', 'Only place a number when it is forced or strongly supported.'],
      },
      {
        heading: 'Candidate and notes basics',
        body: 'Candidates are small pencil marks that track possible numbers for a cell. They help you avoid forgetting options while comparing regions.',
        bullets: ['Use notes for uncertain cells.', 'Remove candidates when a number appears in the same row, column, or box.', 'Do not treat candidates as final answers.'],
      },
      {
        heading: 'Beginner strategy',
        body: 'Beginners should focus on scanning and single-candidate cells. Look for rows, columns, or boxes where a number has only one possible location.',
        bullets: ['Scan one digit at a time.', 'Prefer simple forced moves.', 'Use notes when the board becomes less obvious.'],
      },
      {
        heading: 'Common mistakes',
        body: 'Most early mistakes come from ignoring one of the three rule groups or guessing too early.',
        bullets: ['Do not place a number because it looks likely.', 'Check row, column, and box before placing.', 'Use undo and notes to recover from uncertainty.'],
      },
    ],
  },
  {
    slug: 'building-a-sudoku-routine',
    title: 'Building a Sudoku Routine',
    excerpt: 'A calm repeatable solving routine helps you make steady progress, avoid random guesses, and learn from each puzzle...',
    fakeViews: 6,
    isProOnly: false,
    callout: 'A good routine turns Sudoku from a search problem into a sequence of small, reliable checks.',
    ruleBlock: [
      'Scan first',
      'Add notes second',
      'Place only what is proven',
    ],
    tip: 'If you feel stuck, restart your scan from number 1 and move slowly through 9. Fresh passes often reveal missed singles.',
    sections: [
      {
        heading: 'Why routine matters',
        body: 'Sudoku becomes easier when you solve in a consistent order. A routine reduces missed opportunities and keeps you from jumping around the board randomly.',
        bullets: ['You know what to check next.', 'You waste less time re-checking the same cells.', 'You build stronger pattern recognition over time.'],
      },
      {
        heading: 'Start with an easy scan',
        body: 'Begin each puzzle by scanning for obvious placements. Look for rows, columns, or boxes that already contain many numbers.',
        bullets: ['Check crowded boxes first.', 'Search for missing digits in nearly complete rows.', 'Place only numbers that are clearly forced.'],
      },
      {
        heading: 'Use notes at the right time',
        body: 'Notes are most useful after the obvious placements slow down. They help you track possibilities without committing too early.',
        bullets: ['Avoid filling every cell with every candidate immediately.', 'Add notes where the choice is narrow.', 'Update notes after each confirmed number.'],
      },
      {
        heading: 'Review before guessing',
        body: 'When a board feels stuck, do not guess immediately. Re-scan, inspect candidates, and look for cells or regions with only one possible option.',
        bullets: ['Check whether a number appears in only one place in a box.', 'Look for rows or columns with two or three empty cells.', 'Clean up old notes before making a risky move.'],
      },
      {
        heading: 'Learn from mistakes',
        body: 'A mistake is useful if you understand why it happened. Look back at the row, column, and box that made the number impossible.',
        bullets: ['Ask which rule the move violated.', 'Notice whether you forgot a column, row, or box check.', 'Use the pattern to avoid the same mistake later.'],
      },
    ],
  },
  {
    slug: 'advanced-sudoku-strategies',
    title: 'Advanced Sudoku Strategies',
    excerpt: 'Move beyond basic scanning with candidate elimination, hidden singles, naked pairs, and a solving mindset that avoids guessing...',
    fakeViews: 3,
    isProOnly: true,
    callout: 'Advanced Sudoku is the art of proving what cannot go somewhere before deciding what must go somewhere.',
    ruleBlock: [
      'Eliminate candidates first',
      'Find forced placements second',
      'Guessing is the last resort',
    ],
    tip: 'When stuck, stop searching for numbers and start searching for relationships between candidates.',
    sections: [
      {
        heading: 'Candidate elimination',
        body: 'Advanced solving starts by removing impossible candidates from each cell. Every confirmed number restricts its row, column, and box.',
        bullets: ['Update candidates after every placement.', 'Look for candidates that appear in only one place inside a unit.', 'Treat clean notes as part of the board.'],
      },
      {
        heading: 'Hidden singles',
        body: 'A hidden single happens when a number has only one valid position in a row, column, or box, even if the cell has multiple candidates.',
        bullets: ['Scan a unit for one digit at a time.', 'Count possible positions for that digit.', 'If only one cell remains, that cell is forced.'],
      },
      {
        heading: 'Naked pairs',
        body: 'A naked pair appears when two cells in the same unit contain the exact same two candidates. Those two numbers must occupy those two cells.',
        bullets: ['Find two matching candidate pairs in one unit.', 'Remove those two candidates from other cells in the same unit.', 'Use the cleanup to reveal singles.'],
      },
      {
        heading: 'Scanning rows, columns, and boxes',
        body: 'Scanning is not random looking. Choose a number, then trace rows and columns from existing placements to restrict boxes.',
        bullets: ['Pick one digit.', 'Use existing placements to block lines.', 'Look for boxes where only one location survives.'],
      },
      {
        heading: 'Avoiding guessing',
        body: 'Strong players delay guesses. If no placement is obvious, they improve candidates, compare units, or search for patterns.',
        bullets: ['Do not place uncertain values.', 'Use notes to preserve logic.', 'Backtrack mentally before committing.'],
      },
      {
        heading: 'How advanced players think',
        body: 'Advanced players solve by maintaining constraints. They ask what each number prevents, what each pair controls, and which region is close to finished.',
        bullets: ['Think in units, not isolated cells.', 'Keep candidates accurate.', 'Prefer small logical progress over risky leaps.'],
      },
    ],
  },
]

export function getBlogBySlug(slug) {
  return blogs.find(blog => blog.slug === slug) || null
}
