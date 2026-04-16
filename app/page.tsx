export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center font-sans" style={{ backgroundColor: "#BE132D" }}>
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-center gap-12 py-32 px-16 text-center">
        <div className="flex flex-col items-center gap-4">
          <span className="text-7xl font-light text-white/80 tracking-widest drop-shadow-lg">
            字
          </span>
          <h1 className="text-4xl font-semibold tracking-tight text-white">
            Learn Chinese Characters
          </h1>
          <p className="max-w-md text-lg leading-8 text-white/70">
            Understand characters from the ground up — through the radicals that give them meaning.
          </p>
        </div>

        <div className="flex flex-col gap-4 w-full max-w-xs text-base font-medium">
          <a
            href="/radicals"
            className="flex h-12 w-full items-center justify-center rounded-full bg-white px-5 text-[#BE132D] transition-colors hover:bg-white/90"
          >
            Browse Radicals
          </a>
          <a
            href="/flashcards"
            className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-white/40 px-5 text-white transition-colors hover:bg-white/10"
          >
            Start Flashcards
          </a>
        </div>
      </main>
    </div>
  );
}
