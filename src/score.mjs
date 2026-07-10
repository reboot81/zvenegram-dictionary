export function scoreWord(word, frequency) {
  const length = [...word].length
  const frequencyPoints = frequency
    ? Math.max(0, Math.round(70 - Math.log10(Math.max(1, frequency.rank)) * 9))
    : 0
  const lengthPoints = length <= 8 ? 25 : length <= 10 ? 17 : 10
  return Math.min(100, frequencyPoints + lengthPoints)
}

export function classifyWord({ manuallyIncluded, frequency, flagged, score }) {
  if (manuallyIncluded) return { status: 'approved', reason: 'manual-inclusion' }
  if (flagged) return { status: 'review', reason: 'review-pattern' }
  if (!frequency) return { status: 'review', reason: 'missing-frequency' }
  if (frequency.rank <= 50_000 && score >= 38) return { status: 'approved', reason: 'frequency-and-quality' }
  return { status: 'review', reason: 'low-frequency' }
}
