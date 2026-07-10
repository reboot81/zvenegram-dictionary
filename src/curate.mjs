import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { normalizeWord, parseFrequencyList, readConfig, structuralReason } from './lib.mjs'
import { classifyWord, scoreWord } from './score.mjs'

const source = await readFile('data/raw/svenska-ord.txt', 'utf8')
const frequencyText = await readFile('data/raw/sv-frequency-50k.txt', 'utf8')
const frequencies = parseFrequencyList(frequencyText)
const excluded = new Set((await readConfig('config/exclude.txt')).map(normalizeWord))
const included = new Set((await readConfig('config/include.txt')).map(normalizeWord))
const patterns = (await readConfig('config/review-patterns.txt')).map((pattern) => new RegExp(pattern, 'u'))
const seen = new Set()
const approved = []
const review = []
const rejected = []

for (const raw of source.split(/\r?\n/u)) {
  const word = normalizeWord(raw)
  if (!word) continue
  if (seen.has(word)) { rejected.push({ word, reason: 'duplicate' }); continue }
  seen.add(word)
  const structural = structuralReason(word)
  if (structural) { rejected.push({ word, reason: structural }); continue }
  if (excluded.has(word)) { rejected.push({ word, reason: 'manual-exclusion' }); continue }

  const frequency = frequencies.get(word) ?? null
  const score = scoreWord(word, frequency)
  const classification = classifyWord({
    manuallyIncluded: included.has(word),
    frequency,
    flagged: patterns.some((pattern) => pattern.test(word)),
    score,
  })
  const candidate = {
    word,
    score,
    length: [...word].length,
    frequencyCount: frequency?.count ?? 0,
    frequencyRank: frequency?.rank ?? null,
    reason: classification.reason,
  }
  if (classification.status === 'approved') approved.push(candidate)
  else review.push(candidate)
}

const alphabetically = (a, b) => a.word.localeCompare(b.word, 'sv-SE')
approved.sort(alphabetically)
review.sort((a, b) => b.score - a.score || alphabetically(a, b))
rejected.sort(alphabetically)
const approvedWords = approved.map(({ word }) => word)
const tsv = (rows) => rows.map(({ word, score = '', length = '', frequencyRank = '', reason }) =>
  [word, score, length, frequencyRank ?? '', reason].join('\t')).join('\n')

await mkdir('data/processed', { recursive: true })
await mkdir('data/reports', { recursive: true })
await writeFile('data/processed/words.json', `${JSON.stringify(approvedWords, null, 2)}\n`)
await writeFile('data/processed/words.txt', `${approvedWords.join('\n')}\n`)
await writeFile('data/processed/scored-words.json', `${JSON.stringify(approved, null, 2)}\n`)
await writeFile('data/reports/review.tsv', `word\tscore\tlength\tfrequencyRank\treason\n${tsv(review)}\n`)
await writeFile('data/reports/rejected.tsv', `word\tscore\tlength\tfrequencyRank\treason\n${tsv(rejected)}\n`)
const reasons = [...review, ...rejected].reduce((counts, { reason }) => ({ ...counts, [reason]: (counts[reason] ?? 0) + 1 }), {})
const summary = {
  sourceRows: source.split(/\r?\n/u).filter(Boolean).length,
  uniqueWords: seen.size,
  frequencyEntries: frequencies.size,
  approved: approved.length,
  review: review.length,
  rejected: rejected.length,
  reasons,
}
await writeFile('data/reports/summary.json', `${JSON.stringify(summary, null, 2)}\n`)
console.log(`Approved ${approved.length}; review ${review.length}; rejected ${rejected.length}`)
