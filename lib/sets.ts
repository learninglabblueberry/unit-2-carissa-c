export type FlashCard = {
  character: string
  pinyin: string
  meaning: string
  explanation?: string
  example_sentence?: string
}

export type FlashcardSetMeta = {
  id: string
  name: string
  description: string
  count: number
  builtin: true
}

export type UserSetMeta = {
  id: string
  name: string
  description: string
  count: number
  builtin: false
  createdAt: number
}

export type AnySetMeta = FlashcardSetMeta | UserSetMeta

// Built-in set registry — add entries here as new sets are added to lib/
export const BUILTIN_SETS: FlashcardSetMeta[] = [
  {
    id: 'top-100',
    name: 'Top 100 Characters',
    description: 'The 100 most frequently used Mandarin characters',
    count: 100,
    builtin: true,
  },
]

// localStorage key for the list of user set metadata
export const USER_SETS_INDEX_KEY = 'flashcard_sets_index'

// localStorage key for a specific user set's cards
export function userSetCardsKey(id: string) {
  return `flashcard_set_${id}`
}

// Parse CSV text into FlashCard[]
// Expected columns (order matters, header required):
// character, pinyin, meaning, explanation, example_sentence
export function parseCSV(text: string): FlashCard[] {
  const lines = text.trim().split(/\r?\n/)
  if (lines.length < 2) throw new Error('CSV must have a header row and at least one data row')

  const headers = splitCSVLine(lines[0]).map(h => h.toLowerCase().trim())
  const charIdx = headers.indexOf('character')
  const pinyinIdx = headers.indexOf('pinyin')
  const meaningIdx = headers.indexOf('meaning')
  const explanationIdx = headers.indexOf('explanation')
  const exampleIdx = headers.indexOf('example_sentence')

  if (charIdx === -1 || pinyinIdx === -1 || meaningIdx === -1) {
    throw new Error('CSV must have columns: character, pinyin, meaning')
  }

  return lines.slice(1)
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => {
      const values = splitCSVLine(line)
      const card: FlashCard = {
        character: values[charIdx]?.trim() ?? '',
        pinyin: values[pinyinIdx]?.trim() ?? '',
        meaning: values[meaningIdx]?.trim() ?? '',
      }
      if (explanationIdx !== -1) card.explanation = values[explanationIdx]?.trim()
      if (exampleIdx !== -1) card.example_sentence = values[exampleIdx]?.trim()
      return card
    })
    .filter(c => c.character && c.pinyin && c.meaning)
}

function splitCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++ }
      else inQuotes = !inQuotes
    } else if (ch === ',' && !inQuotes) {
      result.push(current)
      current = ''
    } else {
      current += ch
    }
  }
  result.push(current)
  return result
}

// Parse JSON import — accepts either:
//   { name: string, cards: FlashCard[] }  (preferred)
//   FlashCard[]  (cards only, name must be provided separately)
export function parseJSON(text: string): { name?: string; cards: FlashCard[] } {
  const parsed = JSON.parse(text)
  if (Array.isArray(parsed)) {
    return { cards: parsed }
  }
  if (parsed && typeof parsed === 'object' && Array.isArray(parsed.cards)) {
    return { name: parsed.name, cards: parsed.cards }
  }
  throw new Error('JSON must be an array of cards or { name, cards: [...] }')
}
