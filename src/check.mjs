import { readFile } from 'node:fs/promises'
import { structuralReason } from './lib.mjs'

const words = JSON.parse(await readFile('data/processed/words.json', 'utf8'))
if (!Array.isArray(words)) throw new Error('Processed dictionary must be an array')
if (new Set(words).size !== words.length) throw new Error('Processed dictionary contains duplicates')
for (const word of words) {
  const reason = structuralReason(word)
  if (reason) throw new Error(`${word}: ${reason}`)
}
console.log(`Validated ${words.length} curated words`)
