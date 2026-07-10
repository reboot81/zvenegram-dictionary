import { readFile } from 'node:fs/promises'

export async function readConfig(path) {
  const text = await readFile(path, 'utf8')
  return text.split(/\r?\n/u).map((line) => line.trim()).filter((line) => line && !line.startsWith('#'))
}

export function normalizeWord(value) {
  return value.trim().normalize('NFC').toLocaleLowerCase('sv-SE')
}

export function structuralReason(word) {
  if ([...word].length < 4) return 'shorter-than-4'
  if ([...word].length > 12) return 'longer-than-12'
  if (!/^[a-zåäö]+$/u.test(word)) return 'unsupported-characters'
  return null
}

export function parseFrequencyList(text) {
  const frequencies = new Map()
  text.split(/\r?\n/u).forEach((line, index) => {
    const separator = line.lastIndexOf(' ')
    if (separator < 1) return
    const word = normalizeWord(line.slice(0, separator))
    const count = Number(line.slice(separator + 1))
    if (/^[a-zåäö]+$/u.test(word) && Number.isFinite(count)) frequencies.set(word, { count, rank: index + 1 })
  })
  return frequencies
}
