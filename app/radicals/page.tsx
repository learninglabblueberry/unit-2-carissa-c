import Link from 'next/link'
import RadicalsGrid from './RadicalsGrid'
import radicalsData from '@/lib/radicals.json'
import charactersData from '@/lib/characters.json'
import decompositionsData from '@/lib/character-decompositions.json'

export default function RadicalsPage() {
  // Build reverse lookup: radicalKey -> Character[]
  const decompositions = decompositionsData as Record<string, string[]>
  const charactersByRadical: Record<string, typeof charactersData> = {}

  for (const char of charactersData) {
    const radicalKeys = decompositions[char.character] ?? []
    for (const key of radicalKeys) {
      if (!charactersByRadical[key]) charactersByRadical[key] = []
      charactersByRadical[key].push(char)
    }
  }

  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: '#BE132D' }}>
      <header className="px-6 sm:px-8 pt-8 pb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-white/60 hover:text-white text-sm transition-colors mb-6"
        >
          ← Back
        </Link>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-white/50 text-sm tracking-widest uppercase mb-1">Radical Library</p>
            <h1 className="text-white text-4xl font-bold tracking-tight">
              100 Radicals
            </h1>
            <p className="text-white/60 text-sm mt-2">
              The building blocks of Chinese characters
            </p>
          </div>
          <span
            className="text-8xl leading-none text-white/10 select-none hidden sm:block"
            style={{ fontFamily: '"Noto Serif SC", "Songti SC", "STSong", serif' }}
          >
            部
          </span>
        </div>
      </header>

      <RadicalsGrid radicals={radicalsData} charactersByRadical={charactersByRadical} />
    </div>
  )
}
