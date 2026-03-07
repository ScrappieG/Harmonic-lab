import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

declare const chrome: any
const EXTENSION_ID = import.meta.env.VITE_EXTENSION_ID as string | undefined

function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.access_token && EXTENSION_ID && typeof chrome !== 'undefined') {
        chrome.runtime.sendMessage(EXTENSION_ID, { access_token: session.access_token })
      }
      navigate('/dashboard', { replace: true })
    })
  }, [navigate])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-stone-500">Signing in…</p>
    </div>
  )
}

export default AuthCallback
