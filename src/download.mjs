import { createHash } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'

await mkdir('data/raw', { recursive: true })
const sources = [
  ['svenska-ord.txt', 'https://raw.githubusercontent.com/hising/svenska-ord.txt/master/svenska-ord.txt'],
  ['sv-frequency-50k.txt', 'https://raw.githubusercontent.com/hermitdave/FrequencyWords/master/content/2018/sv/sv_50k.txt'],
]

for (const [filename, url] of sources) {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Download failed for ${url}: ${response.status} ${response.statusText}`)
  const bytes = Buffer.from(await response.arrayBuffer())
  await writeFile(`data/raw/${filename}`, bytes)
  console.log(`${filename}: ${bytes.length} bytes; SHA-256 ${createHash('sha256').update(bytes).digest('hex')}`)
}
