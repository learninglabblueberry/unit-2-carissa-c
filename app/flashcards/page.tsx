import Link from 'next/link'
import SetPicker from './SetPicker'
import { BUILTIN_SETS } from '@/lib/sets'

export default function FlashcardsPage() {
  return (
    <div className="min-h-screen font-sans flex flex-col" style={{ backgroundColor: '#BE132D' }}>
      <header className="px-6 sm:px-8 pt-8 pb-6 flex-shrink-0">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-white/60 hover:text-white text-sm transition-colors mb-6"
        >
          ← Back
        </Link>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-white/50 text-sm tracking-widest uppercase mb-1">Flashcards</p>
            <h1 className="text-white text-4xl font-bold tracking-tight">Choose a set</h1>
            <p className="text-white/60 text-sm mt-2">
              Practice characters or import your own set
            </p>
          </div>
          <span
            className="text-8xl leading-none text-white/10 select-none hidden sm:block"
            style={{ fontFamily: '"Noto Serif SC", "Songti SC", "STSong", serif' }}
          >
            习
          </span>
        </div>
      </header>

      <SetPicker builtinSets={BUILTIN_SETS} />
    </div>
  )
}
