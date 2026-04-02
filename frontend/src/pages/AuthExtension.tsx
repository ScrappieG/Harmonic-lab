import { useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function AuthExtension() {
  useEffect(() => {
    supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?source=extension`,
      },
    })
  }, [])

  return (
    <div className="flex min-h-screen items-center justify-center text-stone-400">
      <p>Redirecting to Google sign-in…</p>
    </div>
  )
}