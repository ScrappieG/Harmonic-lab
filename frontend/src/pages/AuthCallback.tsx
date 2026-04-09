import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

declare const chrome: any
const EXTENSION_ID = import.meta.env.VITE_EXTENSION_ID as string | undefined
const EXTENSION_AUTH_MESSAGE_TYPE = 'articuleet-extension-auth'

function getAllowedExtensionOrigin(): string | null {
  const searchParams = new URLSearchParams(window.location.search)
  const source = searchParams.get('source')
  const returnTo = searchParams.get('returnTo')

  if (source !== 'extension' || !returnTo) {
    return null
  }

  try {
    const url = new URL(returnTo)
    const isLeetCodeHost = url.hostname === 'leetcode.com' || url.hostname.endsWith('.leetcode.com')
    const isSecure = url.protocol === 'https:'

    return isLeetCodeHost && isSecure ? url.origin : null
  } catch {
    return null
  }
}

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
      const extensionOrigin = getAllowedExtensionOrigin()

      if (session?.access_token && extensionOrigin && window.opener && !window.opener.closed) {
        window.opener.postMessage(
          {
            type: EXTENSION_AUTH_MESSAGE_TYPE,
            access_token: session.access_token,
          },
          extensionOrigin,
        )
      } else if (session?.access_token && EXTENSION_ID && typeof chrome !== 'undefined') {
        chrome.runtime.sendMessage(EXTENSION_ID, { access_token: session.access_token })
      }

      if (returnTo) {
        if (window.opener && !window.opener.closed) {
          window.opener.location.href = returnTo
          window.close()
          return
        }

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
