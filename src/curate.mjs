import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { normalizeWord, readConfig, structuralReason } from './lib.mjs'

const source = await readFile('data/raw/svenska-ord.txt', 'utf8')
const excluded = new Set(await readConfig('config/exclude.txt'))
const included = new Set(await readConfig('config/include.txt'))
const patterns = (await readConfig('config/review-patterns.txt')).map((pattern) => new RegExp(pattern, 'u'))
const seen = new Set()
const accepted = []
const review = []
const rejected = []

for (const raw of source.split(/\r?\n/u)) {
  const word = normalizeWord(raw)
  if (!word) continue
  if (seen.has(word)) { rejected.push([word, 'duplicate']); continue }
  seen.add(word)
  const structural = structuralReason(word)
  if (structural) { rejected.push([word, structural]); continue }
  if (excluded.has(word)) { rejected.push([word, 'manual-exclusion']); continue }
  if (!included.has(word) && patterns.some((pattern) => pattern.test(word))) {
    review.push(word)
    continue
  }
  accepted.push(word)
}

accepted.sort((a, b) => a.localeCompare(b, 'sv-SE'))
review.sort((a, b) => a.localeCompare(b, 'sv-SE'))
await mkdir('data/processed', { recursive: true })
await mkdir('data/reports', { recursive: true })
await writeFile('data/processed/words.json', `${JSON.stringify(accepted, null, 2)}\n`)
await writeFile('data/processed/words.txt', `${accepted.join('\n')}\n`)
await writeFile('data/reports/review.txt', `${review.join('\n')}\n`)
await writeFile('data/reports/rejected.tsv', `word\treason\n${rejected.map((row) => row.join('\t')).join('\n')}\n`)
await writeFile('data/reports/summary.json', `${JSON.stringify({ sourceRows: source.split(/\r?\n/u).filter(Boolean).length, uniqueWords: seen.size, accepted: accepted.length, review: review.length, rejected: rejected.length }, null, 2)}\n`)
console.log(`Accepted ${accepted.length}; review ${review.length}; rejected ${rejected.length}`)
