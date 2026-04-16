'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  type FlashcardSetMeta,
  type UserSetMeta,
  type FlashCard,
  USER_SETS_INDEX_KEY,
  userSetCardsKey,
  parseCSV,
  parseJSON,
} from '@/lib/sets'

function SetCard({
  name,
  description,
  count,
  href,
  onDelete,
}: {
  name: string
  description: string
  count: number
  href: string
  onDelete?: () => void
}) {
  return (
    <a
      href={href}
      className="group relative bg-white/95 hover:bg-white rounded-2xl p-5 flex flex-col gap-3 transition-all duration-200 hover:shadow-2xl hover:-translate-y-0.5 cursor-pointer"
    >
      <div className="flex items-start justify-between gap-2">
        <h2 className="text-base font-semibold text-stone-900 leading-snug">{name}</h2>
        {onDelete && (
          <button
            onClick={e => { e.preventDefault(); e.stopPropagation(); onDelete() }}
            className="flex-shrink-0 w-6 h-6 rounded-full text-stone-300 hover:text-red-500 hover:bg-red-50 flex items-center justify-center text-xs transition-colors"
            title="Delete set"
          >
            ✕
          </button>
        )}
      </div>
      <p className="text-xs text-stone-400 leading-relaxed flex-1">{description}</p>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-stone-500">{count} cards</span>
        <span className="text-xs font-semibold text-[#BE132D] opacity-0 group-hover:opacity-100 transition-opacity">
          Practice →
        </span>
      </div>
    </a>
  )
}

function ImportCard({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group bg-white/10 hover:bg-white/20 border-2 border-dashed border-white/20 hover:border-white/40 rounded-2xl p-5 flex flex-col items-center justify-center gap-3 transition-all duration-200 cursor-pointer min-h-[140px]"
    >
      <span className="text-3xl text-white/40 group-hover:text-white/60 transition-colors">+</span>
      <span className="text-sm font-medium text-white/50 group-hover:text-white/70 transition-colors">
        Import set
      </span>
    </button>
  )
}

function ImportModal({ onClose, onImported }: { onClose: () => void; onImported: (meta: UserSetMeta) => void }) {
  const [name, setName] = useState('')
  const [fileContent, setFileContent] = useState('')
  const [fileType, setFileType] = useState<'csv' | 'json' | null>(null)
  const [preview, setPreview] = useState<FlashCard[]>([])
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const handleFile = (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase()
    const type = ext === 'json' ? 'json' : 'csv'
    setFileType(type)
    setError('')
    const reader = new FileReader()
    reader.onload = e => {
      const text = e.target?.result as string
      setFileContent(text)
      try {
        let cards: FlashCard[]
        if (type === 'json') {
          const parsed = parseJSON(text)
          cards = parsed.cards
          if (parsed.name && !name) setName(parsed.name)
        } else {
          cards = parseCSV(text)
        }
        setPreview(cards.slice(0, 3))
        if (!name && file.name) {
          setName(file.name.replace(/\.(csv|json)$/i, '').replace(/[-_]/g, ' '))
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to parse file')
        setPreview([])
      }
    }
    reader.readAsText(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const handleSave = () => {
    if (!fileContent || !name.trim() || preview.length === 0) return
    setSaving(true)
    try {
      let cards: FlashCard[]
      if (fileType === 'json') {
        cards = parseJSON(fileContent).cards
      } else {
        cards = parseCSV(fileContent)
      }

      const id = `user-${Date.now()}`
      const meta: UserSetMeta = {
        id,
        name: name.trim(),
        description: `${cards.length} imported cards`,
        count: cards.length,
        builtin: false,
        createdAt: Date.now(),
      }

      // Save cards
      localStorage.setItem(userSetCardsKey(id), JSON.stringify(cards))

      // Update index
      const existing = JSON.parse(localStorage.getItem(USER_SETS_INDEX_KEY) ?? '[]') as UserSetMeta[]
      localStorage.setItem(USER_SETS_INDEX_KEY, JSON.stringify([...existing, meta]))

      onImported(meta)
      router.push(`/flashcards/${id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
      setSaving(false)
    }
  }

  const canSave = name.trim() && preview.length > 0 && !error

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-stone-900">Import flashcard set</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 flex items-center justify-center transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Set name */}
          <div>
            <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider block mb-1.5">
              Set name
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Lesson 1"
              className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-900 placeholder-stone-300 outline-none focus:border-stone-400 transition-colors"
            />
          </div>

          {/* File drop zone */}
          <div>
            <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider block mb-1.5">
              File <span className="normal-case font-normal text-stone-400">(.csv or .json)</span>
            </label>
            <div
              onDrop={handleDrop}
              onDragOver={e => e.preventDefault()}
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-stone-200 hover:border-stone-400 rounded-xl p-6 text-center cursor-pointer transition-colors"
            >
              {preview.length > 0 ? (
                <p className="text-sm text-stone-600 font-medium">
                  ✓ {fileType?.toUpperCase()} loaded — {preview.length === 3 ? '3+' : preview.length} cards previewed
                </p>
              ) : (
                <>
                  <p className="text-sm text-stone-400">Drop file here or click to browse</p>
                  <p className="text-xs text-stone-300 mt-1">CSV or JSON</p>
                </>
              )}
              <input
                ref={fileRef}
                type="file"
                accept=".csv,.json"
                className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Preview */}
          {preview.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Preview</p>
              <div className="space-y-2">
                {preview.map((card, i) => (
                  <div key={i} className="bg-stone-50 rounded-xl px-4 py-2.5 flex items-baseline gap-3">
                    <span
                      className="text-2xl text-stone-900 flex-shrink-0"
                      style={{ fontFamily: '"Noto Serif SC", "Songti SC", "STSong", serif' }}
                    >
                      {card.character}
                    </span>
                    <span className="text-xs text-stone-400">{card.pinyin}</span>
                    <span className="text-sm text-stone-700 truncate">{card.meaning}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Format hint */}
          <details className="text-xs text-stone-400">
            <summary className="cursor-pointer hover:text-stone-600 transition-colors">
              Expected format
            </summary>
            <div className="mt-2 space-y-2">
              <p className="font-medium text-stone-500">CSV (header required):</p>
              <pre className="bg-stone-50 rounded-lg p-3 text-[11px] overflow-x-auto text-stone-600">
{`character,pinyin,meaning,explanation,example_sentence
你,nǐ,you,,
好,hǎo,good,,`}
              </pre>
              <p className="font-medium text-stone-500 mt-2">JSON:</p>
              <pre className="bg-stone-50 rounded-lg p-3 text-[11px] overflow-x-auto text-stone-600">
{`{ "name": "Lesson 1",
  "cards": [
    { "character":"你","pinyin":"nǐ","meaning":"you" }
  ]
}`}
              </pre>
            </div>
          </details>

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={!canSave || saving}
            className="w-full h-12 rounded-xl font-semibold text-sm text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#BE132D' }}
          >
            {saving ? 'Saving…' : 'Save & Practice'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function SetPicker({ builtinSets }: { builtinSets: FlashcardSetMeta[] }) {
  const [userSets, setUserSets] = useState<UserSetMeta[]>([])
  const [showImport, setShowImport] = useState(false)

  // Load user sets from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(USER_SETS_INDEX_KEY)
      if (stored) setUserSets(JSON.parse(stored))
    } catch { /* ignore */ }
  }, [])

  const deleteUserSet = (id: string) => {
    localStorage.removeItem(userSetCardsKey(id))
    const updated = userSets.filter(s => s.id !== id)
    localStorage.setItem(USER_SETS_INDEX_KEY, JSON.stringify(updated))
    setUserSets(updated)
  }

  return (
    <div className="flex-1 px-6 sm:px-8 pb-16">
      {/* Built-in sets */}
      <div className="mb-6">
        <p className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-3">Built-in</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {builtinSets.map(set => (
            <SetCard
              key={set.id}
              name={set.name}
              description={set.description}
              count={set.count}
              href={`/flashcards/${set.id}`}
            />
          ))}
          <ImportCard onClick={() => setShowImport(true)} />
        </div>
      </div>

      {/* User sets */}
      {userSets.length > 0 && (
        <div>
          <p className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-3">Imported</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {userSets.map(set => (
              <SetCard
                key={set.id}
                name={set.name}
                description={set.description}
                count={set.count}
                href={`/flashcards/${set.id}`}
                onDelete={() => deleteUserSet(set.id)}
              />
            ))}
          </div>
        </div>
      )}

      {showImport && (
        <ImportModal
          onClose={() => setShowImport(false)}
          onImported={meta => {
            setUserSets(prev => [...prev, meta])
            setShowImport(false)
          }}
        />
      )}
    </div>
  )
}
