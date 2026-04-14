import { useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function AuthExtension() {
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search)
    const returnTo = searchParams.get('returnTo')
    const redirectUrl = new URL(`${window.location.origin}/auth/callback`)
    redirectUrl.searchParams.set('source', 'extension')
    if (returnTo) {
      redirectUrl.searchParams.set('returnTo', returnTo)
    }

    supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl.toString(),
      },
    })
  }, [])

  return (
    <div className="flex min-h-screen items-center justify-center text-stone-400">
      <p>Redirecting to Google sign-in…</p>
    </div>
  )
}
