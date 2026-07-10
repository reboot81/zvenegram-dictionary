import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { generatePuzzles } from './generator.mjs'

const options = Object.fromEntries(process.argv.slice(2).map((argument) => {
  const [key, value = 'true'] = argument.replace(/^--/, '').split('=')
  return [key, value]
}))
const scoredWords = JSON.parse(await readFile('data/processed/scored-words.json', 'utf8'))
const output = options.output ?? 'data/generated/puzzles.json'
const puzzles = generatePuzzles(scoredWords, { count: Number(options.count ?? 10), seed: options.seed ?? 'zvenegram-v1' })
await mkdir(output.slice(0, output.lastIndexOf('/')), { recursive: true })
await writeFile(output, `${JSON.stringify(puzzles, null, 2)}\n`)
console.log(`Generated ${puzzles.length} puzzles in ${output}`)
