import { useCallback, useEffect, useState } from 'react'
import { Link, Outlet, useOutletContext } from 'react-router-dom'

import { fetchDashboardHomeData, type DashboardHomeData } from '@/lib/dashboardData'
import { supabase } from '@/lib/supabase'

export const dashboardShellClass = 'mx-auto w-full max-w-5xl px-6 lg:px-8'

type DashboardLayoutContextValue = {
  dashboardData: DashboardHomeData | null
  isLoading: boolean
  error: string | null
  reloadDashboard: () => Promise<void>
}

function DashboardLayout() {
  const [dashboardData, setDashboardData] = useState<DashboardHomeData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadDashboard = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const data = await fetchDashboardHomeData()
      setDashboardData(data)
    } catch (loadError) {
      const message = loadError instanceof Error ? loadError.message : 'Failed to load dashboard.'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadDashboard()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'USER_UPDATED') {
        void loadDashboard()
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [loadDashboard])

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-stone-100 via-stone-100 to-stone-200/45">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-16 left-1/2 h-56 w-[46rem] -translate-x-1/2 rounded-full bg-stone-50/70 blur-3xl" />
        <div className="absolute right-0 top-40 h-64 w-64 rounded-full bg-stone-200/55 blur-3xl" />
      </div>

      <header className="relative z-10 border-b border-stone-200/90 bg-stone-100/88 backdrop-blur-sm">
        <nav className={`${dashboardShellClass} flex items-center py-2.5`}>
          <Link to="/" className="text-lg leading-none tracking-tight text-stone-900">
            <span className="brand-serif">articu</span>
            <span className="brand-mono">Leet</span>
          </Link>

          <button
            type="button"
            className="ml-auto rounded-md border border-stone-300 bg-stone-50 px-3.5 py-1.5 text-xs font-medium text-stone-700 transition-colors hover:bg-stone-200"
          >
            Account
          </button>
        </nav>
      </header>

      <main className={`${dashboardShellClass} relative z-10 py-7 md:py-9`}>
        <Outlet
          context={{
            dashboardData,
            isLoading,
            error,
            reloadDashboard: loadDashboard,
          }}
        />
      </main>
    </div>
  )
}

export function useDashboardLayoutContext() {
  return useOutletContext<DashboardLayoutContextValue>()
}

export default DashboardLayout
