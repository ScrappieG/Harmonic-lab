import { Link } from 'react-router-dom'

function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-stone-200/90 bg-stone-50/95 backdrop-blur-sm">
      <nav className="relative mx-auto flex w-full max-w-[1240px] items-center px-8 py-3 md:px-14">
        <Link to="/" className="text-[26px] leading-none tracking-[-0.03em] text-stone-900">
          <span style={{ fontFamily: '"Hedvig Letters Serif", serif' }}>articu</span>
          <span style={{ fontFamily: '"Chivo Mono", monospace' }}>Leet</span>
        </Link>

        <ul className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-10 text-[15px] font-medium text-stone-500 md:flex">
          <li>
            <a href="#approach" className="transition-colors hover:text-lime-900">
              Approach
            </a>
          </li>
          <li>
            <a href="#how-it-works" className="transition-colors hover:text-lime-900">
              How it works
            </a>
          </li>
          <li>
            <a href="#about" className="transition-colors hover:text-lime-900">
              About
            </a>
          </li>
        </ul>

        <button
          type="button"
          className="ml-auto rounded-lg bg-lime-900 px-5 py-2 text-[15px] font-semibold text-white transition-colors hover:bg-lime-950"
        >
          Sign in
        </button>
      </nav>
    </header>
  )
}

export default Navbar
