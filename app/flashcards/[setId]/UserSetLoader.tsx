'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import FlashcardDeck from '../FlashcardDeck'
import { type FlashCard, userSetCardsKey } from '@/lib/sets'
import radicalsData from '@/lib/radicals.json'
import decompositionsData from '@/lib/character-decompositions.json'

type Radical = (typeof radicalsData)[number]

export default function UserSetLoader({ setId }: { setId: string }) {
  const [cards, setCards] = useState<FlashCard[] | null>(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(userSetCardsKey(setId))
    if (stored) {
      setCards(JSON.parse(stored))
    } else {
      setNotFound(true)
    }
  }, [setId])

  const radicalMap: Record<string, Radical> = {}
  for (const r of radicalsData) radicalMap[r.radical] = r

  const decompositions = decompositionsData as Record<string, string[]>

  if (notFound) {
    return (
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-white/50 text-lg mb-4">Set not found.</p>
          <Link href="/flashcards" className="text-white underline text-sm">
            Back to sets
          </Link>
        </div>
      </div>
    )
  }

  if (!cards) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-white/40 text-sm">Loading…</p>
      </div>
    )
  }

  // Normalize: add an index-based number for display
  const characters = cards.map((c, i) => ({
    number: i + 1,
    character: c.character,
    pinyin: c.pinyin,
    meaning: c.meaning,
    explanation: c.explanation ?? '',
    example_sentence: c.example_sentence ?? '',
  }))

  return (
    <FlashcardDeck
      characters={characters}
      radicalMap={radicalMap}
      decompositions={decompositions}
    />
  )
}
