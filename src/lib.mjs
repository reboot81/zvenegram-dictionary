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
  if (!/^[a-zåäö]+$/u.test(word)) return 'unsupported-characters'
  return null
}
