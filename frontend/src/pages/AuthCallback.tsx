import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

declare const chrome: any
const EXTENSION_ID = import.meta.env.VITE_EXTENSION_ID as string | undefined

function getExtensionReturnTo(): string | null {
  const searchParams = new URLSearchParams(window.location.search)
  const source = searchParams.get('source')
  const returnTo = searchParams.get('returnTo')

  if (source !== 'extension' || !returnTo) {
    return null
  }

  try {
    const url = new URL(returnTo)
    const isLeetCodeHost = url.hostname === 'leetcode.com' || url.hostname.endsWith('.leetcode.com')
    const isProblemPage = url.pathname.includes('/problems/')

    return isLeetCodeHost && isProblemPage ? url.toString() : null
  } catch {
    return null
  }
}

function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const session = data.session
      const returnTo = getExtensionReturnTo()
      if (session?.access_token && EXTENSION_ID && typeof chrome !== 'undefined') {
        chrome.runtime.sendMessage(EXTENSION_ID, { access_token: session.access_token })
      }

      if (returnTo) {
        window.location.replace(returnTo)
        return
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
