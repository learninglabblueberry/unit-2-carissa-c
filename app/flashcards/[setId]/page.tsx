import Link from 'next/link'
import FlashcardDeck from '../FlashcardDeck'
import UserSetLoader from './UserSetLoader'
import charactersData from '@/lib/characters.json'
import radicalsData from '@/lib/radicals.json'
import decompositionsData from '@/lib/character-decompositions.json'
import { BUILTIN_SETS } from '@/lib/sets'

// Map built-in set IDs to their data
const BUILTIN_DATA: Record<string, typeof charactersData> = {
  'top-100': charactersData,
}

export default async function FlashcardSessionPage({
  params,
  searchParams,
}: {
  params: Promise<{ setId: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { setId } = await params
  const { radical: radicalParam } = await searchParams
  const radicalKey = typeof radicalParam === 'string' ? radicalParam : null

  // Build radical lookup
  const radicalMap: Record<string, (typeof radicalsData)[number]> = {}
  for (const r of radicalsData) radicalMap[r.radical] = r

  const decompositions = decompositionsData as Record<string, string[]>

  // User-imported set — handled entirely client-side
  if (setId.startsWith('user-')) {
    return (
      <div className="min-h-screen font-sans flex flex-col" style={{ backgroundColor: '#BE132D' }}>
        <SessionHeader setId={setId} radicalKey={null} radicalMap={radicalMap} />
        <UserSetLoader setId={setId} />
      </div>
    )
  }

  // Built-in set
  const builtinMeta = BUILTIN_SETS.find(s => s.id === setId)
  const allCards = BUILTIN_DATA[setId]

  if (!builtinMeta || !allCards) {
    return (
      <div className="min-h-screen font-sans flex flex-col items-center justify-center" style={{ backgroundColor: '#BE132D' }}>
        <p className="text-white/50 text-lg mb-4">Set not found.</p>
        <Link href="/flashcards" className="text-white underline text-sm">Back to sets</Link>
      </div>
    )
  }

  // Apply radical filter if present
  const characters = radicalKey
    ? allCards.filter(c => (decompositions[c.character] ?? []).includes(radicalKey))
    : allCards

  const activeRadical = radicalKey ? radicalMap[radicalKey] : null

  return (
    <div className="min-h-screen font-sans flex flex-col" style={{ backgroundColor: '#BE132D' }}>
      <SessionHeader
        setId={setId}
        radicalKey={radicalKey}
        radicalMap={radicalMap}
        setName={builtinMeta.name}
        characterCount={characters.length}
      />

      {characters.length === 0 ? (
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="text-center">
            <p className="text-white/50 text-lg mb-4">No cards match this radical.</p>
            <Link href="/flashcards" className="text-white underline text-sm">Back to sets</Link>
          </div>
        </div>
      ) : (
        <FlashcardDeck
          characters={characters}
          radicalMap={radicalMap}
          decompositions={decompositions}
          activeRadical={activeRadical ?? undefined}
        />
      )}
    </div>
  )
}

function SessionHeader({
  setId,
  radicalKey,
  radicalMap,
  setName,
  characterCount,
}: {
  setId: string
  radicalKey: string | null
  radicalMap: Record<string, (typeof radicalsData)[number]>
  setName?: string
  characterCount?: number
}) {
  const activeRadical = radicalKey ? radicalMap[radicalKey] : null
  const displayChar = activeRadical
    ? (activeRadical.radical.length === 1 ? activeRadical.radical : '阝')
    : null

  const backHref = radicalKey ? '/radicals' : '/flashcards'
  const backLabel = radicalKey ? 'Back to radicals' : 'Back to sets'

  return (
    <header className="px-6 sm:px-8 pt-8 pb-6 flex-shrink-0">
      <Link
        href={backHref}
        className="inline-flex items-center gap-1.5 text-white/60 hover:text-white text-sm transition-colors mb-6"
      >
        ← {backLabel}
      </Link>
      <div className="flex items-end justify-between">
        <div>
          {activeRadical ? (
            <>
              <p className="text-white/50 text-sm tracking-widest uppercase mb-1">
                Radical · {activeRadical.pinyin}
              </p>
              <h1 className="text-white text-4xl font-bold tracking-tight flex items-baseline gap-3">
                <span style={{ fontFamily: '"Noto Serif SC", "Songti SC", "STSong", serif' }}>
                  {displayChar}
                </span>
                <span>{activeRadical.meaning}</span>
              </h1>
              <p className="text-white/60 text-sm mt-2">
                {characterCount} character{characterCount !== 1 ? 's' : ''} from {setName ?? setId}
              </p>
            </>
          ) : (
            <>
              <p className="text-white/50 text-sm tracking-widest uppercase mb-1">Flashcards</p>
              <h1 className="text-white text-4xl font-bold tracking-tight">
                {setName ?? setId}
              </h1>
              <p className="text-white/60 text-sm mt-2">Tap a card to reveal its meaning</p>
            </>
          )}
        </div>
        <span
          className="text-8xl leading-none text-white/10 select-none hidden sm:block"
          style={{ fontFamily: '"Noto Serif SC", "Songti SC", "STSong", serif' }}
        >
          {displayChar ?? '习'}
        </span>
      </div>
    </header>
  )
}
