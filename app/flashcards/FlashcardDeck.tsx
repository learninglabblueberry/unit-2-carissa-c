'use client'

import { useState, useCallback, useRef, useEffect } from 'react'

type Character = {
  number?: number
  character: string
  pinyin: string
  meaning: string
  explanation: string
  example_sentence: string
}

type Radical = {
  radical: string
  variations: string
  pinyin: string
  meaning: string
  examples: string[]
  disambiguation_note: string
  image_file: string
}

type Props = {
  characters: Character[]
  radicalMap: Record<string, Radical>
  decompositions: Record<string, string[]>
  activeRadical?: Radical
}

function RadicalChip({
  radicalKey,
  radical,
}: {
  radicalKey: string
  radical: Radical
}) {
  const [open, setOpen] = useState(false)
  const [imgFailed, setImgFailed] = useState(false)
  const chipRef = useRef<HTMLButtonElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
  }
  const scheduleClose = () => {
    closeTimer.current = setTimeout(() => setOpen(false), 120)
  }

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (
        chipRef.current?.contains(e.target as Node) ||
        tooltipRef.current?.contains(e.target as Node)
      ) return
      setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  // Display character: if key is "阝right" or "阝left", show 阝
  const displayChar = radicalKey.length === 1 ? radicalKey : '阝'

  return (
    <div className="relative">
      <button
        ref={chipRef}
        onMouseEnter={() => { cancelClose(); setOpen(true) }}
        onMouseLeave={scheduleClose}
        onFocus={() => setOpen(true)}
        onBlur={scheduleClose}
        onClick={() => setOpen(o => !o)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-100 hover:bg-amber-100 border border-stone-200 hover:border-amber-300 text-stone-700 text-sm font-medium transition-colors cursor-pointer select-none"
      >
        <span style={{ fontFamily: '"Noto Serif SC", "Songti SC", "STSong", serif', fontSize: '1.1em' }}>
          {displayChar}
        </span>
        <span className="text-stone-500 text-xs">{radical.meaning.split(',')[0]}</span>
      </button>

      {open && (
        <div
          ref={tooltipRef}
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-48 bg-white rounded-2xl shadow-2xl border border-stone-100 overflow-hidden"
        >
          {/* Radical image */}
          <div className="w-full aspect-square bg-stone-50 flex items-center justify-center overflow-hidden">
            {!imgFailed ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={`/${radical.image_file}`}
                alt={radical.meaning}
                className="w-full h-full object-cover"
                onError={() => setImgFailed(true)}
              />
            ) : (
              <span
                className="text-5xl"
                style={{ fontFamily: '"Noto Serif SC", "Songti SC", "STSong", serif', color: '#BE132D' }}
              >
                {displayChar}
              </span>
            )}
          </div>
          <div className="px-3 py-2.5">
            <p className="text-[10px] text-stone-400 tracking-widest uppercase">{radical.pinyin}</p>
            <p className="text-sm font-semibold text-stone-800 leading-snug mt-0.5">{radical.meaning}</p>
            {radical.disambiguation_note && (
              <p className="text-xs text-stone-500 mt-1 leading-relaxed">{radical.disambiguation_note}</p>
            )}
          </div>
          {/* Arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-white" />
        </div>
      )}
    </div>
  )
}

function Flashcard({
  character,
  radicalMap,
  decompositions,
  isFlipped,
  onFlip,
}: {
  character: Character
  radicalMap: Record<string, Radical>
  decompositions: Record<string, string[]>
  isFlipped: boolean
  onFlip: () => void
}) {
  const radicalKeys = decompositions[character.character] ?? []
  const radicals = radicalKeys
    .map(key => ({ key, radical: radicalMap[key] }))
    .filter(r => r.radical != null)

  return (
    <div
      className="relative w-full cursor-pointer select-none"
      style={{ perspective: '1200px' }}
      onClick={onFlip}
    >
      <div
        className="relative w-full transition-transform duration-500"
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          minHeight: '420px',
        }}
      >
        {/* FRONT */}
        <div
          className="absolute inset-0 bg-white rounded-3xl shadow-2xl flex flex-col items-center justify-center p-8 gap-6"
          style={{ backfaceVisibility: 'hidden' }}
        >
          {/* Number badge */}
          <span className="absolute top-5 left-6 text-xs text-stone-400 font-mono tracking-widest">
            {character.number != null ? `#${character.number}` : ''}
          </span>

          {/* Large character */}
          <span
            className="text-[120px] leading-none text-stone-900 select-none"
            style={{ fontFamily: '"Noto Serif SC", "Songti SC", "STSong", serif' }}
          >
            {character.character}
          </span>

          {/* Pinyin */}
          <p className="text-xl text-stone-500 tracking-wide">{character.pinyin}</p>

          {/* Radical chips */}
          {radicals.length > 0 && (
            <div
              className="flex flex-wrap gap-2 justify-center"
              onClick={e => e.stopPropagation()}
            >
              {radicals.map(({ key, radical }) => (
                <RadicalChip key={key} radicalKey={key} radical={radical} />
              ))}
            </div>
          )}

          {/* Tap hint */}
          <p className="absolute bottom-5 text-xs text-stone-300">tap to reveal</p>
        </div>

        {/* BACK */}
        <div
          className="absolute inset-0 bg-white rounded-3xl shadow-2xl flex flex-col p-8 gap-5 overflow-y-auto"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          {/* Number badge */}
          <span className="absolute top-5 left-6 text-xs text-stone-400 font-mono tracking-widest">
            {character.number != null ? `#${character.number}` : ''}
          </span>

          {/* Character + pinyin small at top */}
          <div className="flex items-baseline gap-3 mt-4">
            <span
              className="text-5xl text-stone-900"
              style={{ fontFamily: '"Noto Serif SC", "Songti SC", "STSong", serif' }}
            >
              {character.character}
            </span>
            <span className="text-lg text-stone-400">{character.pinyin}</span>
          </div>

          {/* Meaning */}
          <div>
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-1">Meaning</p>
            <p className="text-2xl font-bold text-stone-900 leading-tight">{character.meaning}</p>
          </div>

          {/* Explanation */}
          <div className="bg-stone-50 rounded-2xl p-4">
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-1.5">Explanation</p>
            <p className="text-sm text-stone-600 leading-relaxed">{character.explanation}</p>
          </div>

          {/* Example */}
          <div>
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-1.5">Example</p>
            <p className="text-sm text-stone-700 leading-relaxed">{character.example_sentence}</p>
          </div>

          <p className="absolute bottom-5 right-6 text-xs text-stone-300">tap to flip back</p>
        </div>
      </div>
    </div>
  )
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function FlashcardDeck({ characters, radicalMap, decompositions }: Props) {
  const [deck, setDeck] = useState(characters)
  const [index, setIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [known, setKnown] = useState<Set<string>>(new Set())
  const [shuffled, setShuffled] = useState(false)

  const current = deck[index]

  const goTo = useCallback((newIndex: number) => {
    setIsFlipped(false)
    // Small delay so the flip-back finishes before slide
    setTimeout(() => setIndex(newIndex), isFlipped ? 200 : 0)
  }, [isFlipped])

  const prev = () => { if (index > 0) goTo(index - 1) }
  const next = () => { if (index < deck.length - 1) goTo(index + 1) }

  const toggleShuffle = () => {
    if (shuffled) {
      setDeck(characters)
      setIndex(0)
    } else {
      setDeck(shuffleArray(characters))
      setIndex(0)
    }
    setIsFlipped(false)
    setShuffled(s => !s)
  }

  const markKnown = (e: React.MouseEvent) => {
    e.stopPropagation()
    const key = current.character
    setKnown(prev => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next()
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') prev()
      else if (e.key === ' ' || e.key === 'Enter') setIsFlipped(f => !f)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, deck])

  return (
    <div className="flex-1 flex flex-col items-center px-6 sm:px-8 pb-16">
      {/* Stats bar */}
      <div className="w-full max-w-sm flex items-center justify-between mb-6 text-sm">
        <span className="text-white/60">
          {index + 1} <span className="text-white/30">/ {deck.length}</span>
        </span>
        <span className="text-white/60">
          {known.size > 0 && (
            <span className="text-emerald-300/80">{known.size} known</span>
          )}
        </span>
        <button
          onClick={toggleShuffle}
          className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
            shuffled
              ? 'border-white/60 text-white bg-white/10'
              : 'border-white/20 text-white/50 hover:text-white/70 hover:border-white/40'
          }`}
        >
          ⇄ Shuffle
        </button>
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-sm mb-8 h-1 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-white/40 rounded-full transition-all duration-300"
          style={{ width: `${((index + 1) / deck.length) * 100}%` }}
        />
      </div>

      {/* Card */}
      <div className="w-full max-w-sm">
        <Flashcard
          character={current}
          radicalMap={radicalMap}
          decompositions={decompositions}
          isFlipped={isFlipped}
          onFlip={() => setIsFlipped(f => !f)}
        />
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4 mt-8">
        <button
          onClick={prev}
          disabled={index === 0}
          className="w-11 h-11 rounded-full border border-white/20 text-white/60 hover:text-white hover:border-white/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center justify-center text-lg"
        >
          ←
        </button>

        <button
          onClick={markKnown}
          className={`px-5 py-2.5 rounded-full text-sm font-medium transition-colors ${
            known.has(current.character)
              ? 'bg-emerald-500 text-white hover:bg-emerald-600'
              : 'border border-white/20 text-white/60 hover:text-white hover:border-white/50'
          }`}
        >
          {known.has(current.character) ? '✓ Known' : 'Mark known'}
        </button>

        <button
          onClick={next}
          disabled={index === deck.length - 1}
          className="w-11 h-11 rounded-full border border-white/20 text-white/60 hover:text-white hover:border-white/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center justify-center text-lg"
        >
          →
        </button>
      </div>

      <p className="mt-6 text-white/30 text-xs">← → arrow keys or space to flip</p>
    </div>
  )
}
