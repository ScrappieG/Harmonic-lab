import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

async function signInWithGoogle() {
  await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${window.location.origin}/auth/callback` },
  })
}

function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-stone-200/90 bg-stone-50/95 backdrop-blur-sm">
      <nav className="layout-shell relative flex items-center py-3">
        <Link to="/" className="text-2xl leading-none tracking-tight text-stone-900">
          <span className="brand-serif">articu</span>
          <span className="brand-mono">Leet</span>
        </Link>

        <ul className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-10 text-sm font-medium text-stone-500 md:flex">
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
          onClick={signInWithGoogle}
          className="ml-auto rounded-lg bg-lime-900 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-lime-950"
        >
          Sign in
        </button>
      </nav>
    </header>
  )
}

export default Navbar
