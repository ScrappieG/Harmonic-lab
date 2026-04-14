import { supabase } from '@/lib/supabase'

const apiBaseUrl = (import.meta.env.VITE_API_BASE as string | undefined) ?? 'https://api.articuleet.com'

export async function deleteCurrentAccount(): Promise<void> {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session?.access_token) {
    throw new Error('You must be signed in to delete your account.')
  }

  const response = await fetch(`${apiBaseUrl}/me`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(errorText || 'Failed to delete account.')
  }
}
