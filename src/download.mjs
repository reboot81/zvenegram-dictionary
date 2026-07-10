import { createHash } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'

const url = 'https://raw.githubusercontent.com/hising/svenska-ord.txt/master/svenska-ord.txt'
const response = await fetch(url)
if (!response.ok) throw new Error(`Download failed: ${response.status} ${response.statusText}`)
const bytes = Buffer.from(await response.arrayBuffer())
await mkdir('data/raw', { recursive: true })
await writeFile('data/raw/svenska-ord.txt', bytes)
console.log(`Downloaded ${bytes.length} bytes`)
console.log(`SHA-256 ${createHash('sha256').update(bytes).digest('hex')}`)
