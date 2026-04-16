'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'

type Radical = {
  radical: string
  variations: string
  pinyin: string
  meaning: string
  examples: string[]
  disambiguation_note: string
  image_file: string
}

type Character = {
  number: number
  character: string
  pinyin: string
  meaning: string
  explanation: string
  example_sentence: string
}

function RadicalCard({ radical, onClick }: { radical: Radical; onClick: () => void }) {
  const [imgFailed, setImgFailed] = useState(false)

  return (
    <button
      onClick={onClick}
      className="group bg-white/95 hover:bg-white rounded-2xl overflow-hidden flex flex-col items-center text-center transition-all duration-200 hover:shadow-2xl hover:-translate-y-1 cursor-pointer"
    >
      <div className="w-full aspect-square flex items-center justify-center bg-stone-50 group-hover:bg-amber-50 transition-colors overflow-hidden">
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
            className="text-5xl sm:text-6xl select-none"
            style={{ fontFamily: '"Noto Serif SC", "Songti SC", "STSong", serif', color: '#BE132D' }}
          >
            {radical.radical.length === 1 ? radical.radical : '阝'}
          </span>
        )}
      </div>

      <div className="px-3 py-3 w-full">
        <p className="text-[11px] text-stone-400 tracking-widest uppercase mb-0.5">{radical.pinyin}</p>
        <p className="text-sm font-semibold text-stone-800 leading-tight line-clamp-2">{radical.meaning}</p>
      </div>
    </button>
  )
}

function PracticeCharacterCard({ char }: { char: Character }) {
  return (
    <div className="bg-stone-50 rounded-2xl p-3 flex flex-col items-center text-center gap-1 min-w-0">
      <span
        className="text-4xl leading-none text-stone-900 select-none"
        style={{ fontFamily: '"Noto Serif SC", "Songti SC", "STSong", serif' }}
      >
        {char.character}
      </span>
      <span className="text-[11px] text-stone-400 tracking-widest">{char.pinyin}</span>
    </div>
  )
}

function DetailModal({
  radical,
  practiceCharacters,
  onClose,
}: {
  radical: Radical
  practiceCharacters: Character[]
  onClose: () => void
}) {
  const [imgFailed, setImgFailed] = useState(false)

  // URL-encode the radical key for the flashcard link
  const practiceUrl = `/flashcards/top-100?radical=${encodeURIComponent(radical.radical)}`
  const displayChar = radical.radical.length === 1 ? radical.radical : '阝'

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Image */}
        <div className="w-full aspect-square rounded-t-3xl overflow-hidden bg-stone-50">
          {!imgFailed ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`/${radical.image_file}`}
              alt={radical.meaning}
              className="w-full h-full object-cover"
              onError={() => setImgFailed(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span
                className="text-9xl"
                style={{ fontFamily: '"Noto Serif SC", "Songti SC", "STSong", serif', color: '#BE132D' }}
              >
                {displayChar}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Title row */}
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-stone-400 tracking-widest uppercase">{radical.pinyin}</p>
              <h2 className="text-2xl font-bold text-stone-900 mt-0.5">{radical.meaning}</h2>
              {radical.variations && (
                <p className="text-sm text-stone-500 mt-1">
                  Variants:{' '}
                  <span className="font-medium text-stone-700" style={{ fontFamily: 'serif' }}>
                    {displayChar}　{radical.variations}
                  </span>
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-stone-400 hover:text-stone-700 flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full hover:bg-stone-100 transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Disambiguation note */}
          {radical.disambiguation_note && (
            <div className="bg-stone-50 rounded-2xl p-4">
              <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">Note</p>
              <p className="text-sm text-stone-600 leading-relaxed">{radical.disambiguation_note}</p>
            </div>
          )}

          {/* Practice section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                Practice characters with this radical
              </p>
              {practiceCharacters.length > 0 && (
                <Link
                  href={practiceUrl}
                  onClick={onClose}
                  className="text-xs font-semibold px-3 py-1.5 rounded-full transition-colors text-white"
                  style={{ backgroundColor: '#BE132D' }}
                >
                  Flashcards →
                </Link>
              )}
            </div>

            {practiceCharacters.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {practiceCharacters.map(char => (
                  <PracticeCharacterCard key={char.number} char={char} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-stone-400 italic">
                None of the top 100 characters use this radical.
              </p>
            )}
          </div>

          {/* Encyclopedia examples (all example chars) */}
          {radical.examples?.[0] && (
            <div>
              <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">
                More examples
              </p>
              <div className="flex flex-wrap gap-2">
                {radical.examples[0].split('').map((char, i) => (
                  <span
                    key={i}
                    className="w-10 h-10 bg-stone-50 rounded-lg flex items-center justify-center text-xl border border-stone-100 text-stone-800"
                    style={{ fontFamily: 'serif' }}
                  >
                    {char}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function RadicalsGrid({
  radicals,
  charactersByRadical,
}: {
  radicals: Radical[]
  charactersByRadical: Record<string, Character[]>
}) {
  const [selected, setSelected] = useState<Radical | null>(null)
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    if (!q) return radicals
    return radicals.filter(r =>
      r.meaning.toLowerCase().includes(q) ||
      r.radical.includes(q) ||
      r.pinyin.toLowerCase().includes(q)
    )
  }, [radicals, search])

  const practiceCharacters = selected ? (charactersByRadical[selected.radical] ?? []) : []

  return (
    <>
      <div className="px-6 sm:px-8 pb-6">
        <input
          type="text"
          placeholder="Search by meaning, character, or pinyin…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full max-w-sm bg-white/10 text-white placeholder-white/40 border border-white/20 rounded-full px-5 py-2.5 text-sm outline-none focus:bg-white/20 transition-colors"
        />
        {search && (
          <p className="text-white/50 text-xs mt-2 pl-1">
            {filtered.length} of {radicals.length} radicals
          </p>
        )}
      </div>

      <div className="px-6 sm:px-8 pb-16">
        {filtered.length === 0 ? (
          <p className="text-white/50 text-center py-16">No radicals match &ldquo;{search}&rdquo;</p>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3">
            {filtered.map((radical) => (
              <RadicalCard
                key={radical.radical}
                radical={radical}
                onClick={() => setSelected(radical)}
              />
            ))}
          </div>
        )}
      </div>

      {selected && (
        <DetailModal
          radical={selected}
          practiceCharacters={practiceCharacters}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  )
}
