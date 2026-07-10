const GRID = 4
const CELLS = 16
const MIN_WORDS = 7
const TARGET_WORDS = 12
const MAX_WORDS = 15
const ids = Array.from({ length: CELLS }, (_, index) => `c${index}`)

function seedNumber(value) {
  let hash = 2166136261
  for (const character of value) { hash ^= character.codePointAt(0); hash = Math.imul(hash, 16777619) }
  return hash >>> 0
}

function createRandom(seed) {
  let state = seedNumber(seed)
  return () => {
    state += 0x6D2B79F5
    let value = state
    value = Math.imul(value ^ value >>> 15, value | 1)
    value ^= value + Math.imul(value ^ value >>> 7, value | 61)
    return ((value ^ value >>> 14) >>> 0) / 4294967296
  }
}

function shuffle(values, random) {
  const copy = [...values]
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const target = Math.floor(random() * (index + 1))
    ;[copy[index], copy[target]] = [copy[target], copy[index]]
  }
  return copy
}

function cellNeighbors(index) {
  const row = Math.floor(index / GRID); const column = index % GRID
  const result = []
  for (let dy = -1; dy <= 1; dy += 1) for (let dx = -1; dx <= 1; dx += 1) {
    if (!dx && !dy) continue
    const nextRow = row + dy; const nextColumn = column + dx
    if (nextRow >= 0 && nextRow < GRID && nextColumn >= 0 && nextColumn < GRID) result.push(nextRow * GRID + nextColumn)
  }
  return result
}

const neighbors = Array.from({ length: CELLS }, (_, index) => cellNeighbors(index))

function nested(word, words) { return words.some((other) => other.includes(word) || word.includes(other)) }

function countPaths(word, board, limit = 2) {
  const letters = [...word]
  const starts = ids.filter((_, index) => board[index] === letters[0])
  let count = 0
  function visit(path, index) {
    if (count >= limit) return
    if (index === letters.length - 1) {
      count += 1
      return
    }
    const nextCells = path.length ? neighbors[path.at(-1)] : starts.map((id) => Number(id.slice(1)))
    for (const cell of nextCells) {
      if (path.includes(cell)) continue
      if (board[cell] !== letters[index + 1]) continue
      visit([...path, cell], index + 1)
      if (count >= limit) return
    }
  }
  for (const start of starts.map((id) => Number(id.slice(1)))) {
    visit([start], 0)
    if (count >= limit) break
  }
  return count
}

function placements(word, board, random, requireOverlap, maximumNew, allowNoNew = false, limit = 12) {
  const result = []
  const letters = [...word]
  const starts = shuffle(Array.from({ length: CELLS }, (_, index) => index), random)
  function visit(path, overlap, added) {
    if (result.length >= limit) return
    if (path.length === letters.length) {
      if ((!requireOverlap || overlap) && (allowNoNew || added > 0) && added <= maximumNew) result.push({ path, overlap, added })
      return
    }
    const candidates = path.length ? neighbors[path.at(-1)] : starts
    for (const cell of shuffle(candidates, random)) {
      if (path.includes(cell)) continue
      const existing = board[cell]
      if (existing && existing !== letters[path.length]) continue
      const newCount = added + (existing ? 0 : 1)
      if (newCount > maximumNew) continue
      visit([...path, cell], overlap + (existing ? 1 : 0), newCount)
      if (result.length >= limit) return
    }
  }
  visit([], 0, 0)
  return result
}

function apply(board, word, path) {
  const next = [...board]
  ;[...word].forEach((letter, index) => { next[path[index]] = letter })
  return next
}

function generateOne(candidates, random) {
  const seeds = shuffle(candidates.filter(({ word }) => word.length >= 7 && word.length <= 10), random)
  const starter = seeds[0]
  if (!starter) return null
  const empty = Array(CELLS).fill(null)
  const first = placements(starter.word, empty, random, false, starter.word.length, 1)[0]
  if (!first) return null
  let board = apply(empty, starter.word, first.path)
  const selected = [{ ...starter, path: first.path }]

  for (let step = 0; step < 48 && selected.length < MAX_WORDS; step += 1) {
    const emptyCount = board.filter((value) => value === null).length
    const options = []
    for (const candidate of shuffle(candidates, random).slice(0, 3000)) {
      if (selected.some(({ word }) => word === candidate.word) || nested(candidate.word, selected.map(({ word }) => word))) continue
      for (const placement of placements(candidate.word, board, random, true, emptyCount, true, 3)) options.push({ candidate, placement })
      if (options.length >= 120) break
    }
    if (!options.length) return null
    options.sort((a, b) => {
      const aProgress = board.includes(null) ? a.placement.added : a.placement.overlap
      const bProgress = board.includes(null) ? b.placement.added : b.placement.overlap
      return bProgress - aProgress || b.candidate.score - a.candidate.score
    })
    const choice = options[Math.floor(random() * Math.min(options.length, 18))]
    board = apply(board, choice.candidate.word, choice.placement.path)
    selected.push({ ...choice.candidate, path: choice.placement.path })
  }
  return board.includes(null) || selected.length < MIN_WORDS ? null : { board, selected }
}

function puzzleFrom(result, index, seed) {
  const edges = new Map()
  const words = result.selected.map(({ word, path }) => {
    path.slice(1).forEach((cell, pathIndex) => {
      const pair = [ids[path[pathIndex]], ids[cell]].sort()
      edges.set(pair.join('|'), pair)
    })
    return { word: word.toLocaleUpperCase('sv-SE'), path: path.map((cell) => ids[cell]) }
  })
  const averageLength = words.reduce((sum, word) => sum + [...word.word].length, 0) / words.length
  return {
    id: `generated-${seed}-${String(index + 1).padStart(3, '0')}`,
    title: `Ordfläta ${index + 1}`,
    difficulty: averageLength >= 7 ? 'Svår' : averageLength >= 5.5 ? 'Medel' : 'Lätt',
    layout: ids,
    nodes: result.board.map((letter, index) => ({ id: ids[index], letter: letter.toLocaleUpperCase('sv-SE'), x: 0, y: 0 })),
    edges: [...edges.values()],
    words,
  }
}

export function validatePuzzle(puzzle) {
  if (puzzle.nodes.length !== 16 || puzzle.layout.length !== 16) throw new Error('Puzzle must use exactly 16 cells')
  const position = new Map(puzzle.layout.map((id, index) => [id, [index % GRID, Math.floor(index / GRID)]]))
  const board = puzzle.nodes.map(({ letter }) => letter.toLocaleLowerCase('sv-SE'))
  const used = new Set()
  puzzle.words.forEach(({ word, path }) => {
    if ([...word].length !== path.length || new Set(path).size !== path.length) throw new Error(`Invalid path for ${word}`)
    path.forEach((id) => used.add(id))
    path.slice(1).forEach((id, index) => {
      const from = position.get(path[index]); const to = position.get(id)
      if (!from || !to || Math.abs(from[0] - to[0]) > 1 || Math.abs(from[1] - to[1]) > 1) throw new Error(`Invalid step for ${word}`)
    })
    if (countPaths(word.toLocaleLowerCase('sv-SE'), board) !== 1) throw new Error(`Ambiguous path for ${word}`)
  })
  if (used.size !== 16) throw new Error('Every cell must belong to a word')
  puzzle.words.forEach(({ word }, index) => puzzle.words.slice(index + 1).forEach(({ word: other }) => {
    const [shorter, longer] = word.length <= other.length ? [word, other] : [other, word]
    if (longer.includes(shorter)) throw new Error(`Nested words: ${shorter}/${longer}`)
  }))
  return true
}

export function generatePuzzles(scoredWords, { count = 10, seed = 'zvenegram-v1', attempts = 5000 } = {}) {
  const candidates = scoredWords.filter(({ word, score }) => word.length >= 4 && word.length <= 12 && score >= 38).sort((a, b) => b.score - a.score)
  const random = createRandom(seed)
  const puzzles = []
  for (let index = 0; index < count; index += 1) {
    let result = null
    for (let attempt = 0; attempt < attempts && !result; attempt += 1) {
      const candidate = generateOne(candidates, random)
      if (!candidate) continue
      try {
        validatePuzzle(puzzleFrom(candidate, index, seed))
        result = candidate
      } catch {
        continue
      }
    }
    if (!result) throw new Error(`Unable to create puzzle ${index + 1} after ${attempts} layout attempts`)
    const puzzle = puzzleFrom(result, index, seed)
    validatePuzzle(puzzle)
    if (puzzle.words.length < MIN_WORDS) throw new Error(`Puzzle ${index + 1} has too few words`)
    puzzles.push(puzzle)
  }
  return puzzles
}
