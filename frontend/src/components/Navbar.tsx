import { Link } from 'react-router-dom'
import { useAuthStatus } from '@/hooks/useAuthStatus'
import { supabase } from '../lib/supabase'
import { Skeleton } from './ui/skeleton'

async function signInWithGoogle() {
  await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${window.location.origin}/auth/callback` },
  })
}

function Navbar() {
  const { isAuthenticated, isLoading } = useAuthStatus()

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

        <div className="ml-auto flex h-10 w-28 items-center justify-end">
          {isLoading ? (
            <Skeleton className="h-10 w-28 rounded-lg" />
          ) : isAuthenticated ? (
            <Link
              to="/dashboard"
              className="inline-flex h-10 w-28 items-center justify-center rounded-lg bg-lime-900 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-lime-950"
            >
              Dashboard
            </Link>
          ) : (
            <button
              type="button"
              onClick={signInWithGoogle}
              className="h-10 w-28 rounded-lg bg-lime-900 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-lime-950"
            >
              Sign in
            </button>
          )}
        </div>
      </nav>
    </header>
  )
}

export default Navbar
