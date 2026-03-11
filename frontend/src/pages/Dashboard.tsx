import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'

import SessionList from '@/components/dashboard/SessionList'
import type { DashboardStats, SessionListItem, SessionTrendPoint } from '@/components/dashboard/types'
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'
import { fetchDashboardHomeData } from '@/lib/dashboardData'
import { supabase } from '@/lib/supabase'

const chartConfig = {
  score: {
    label: 'Score',
    color: 'rgb(82 97 58)',
  },
} satisfies ChartConfig

const dashboardShellClass = 'mx-auto w-full max-w-5xl px-6 lg:px-8'

const emptyStats: DashboardStats = {
  sessions: 0,
  avgScore: 0,
  maxScore: 4,
  totalMinutes: 0,
}

async function signInWithGoogle() {
  await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${window.location.origin}/auth/callback` },
  })
}

function Dashboard() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSignedIn, setIsSignedIn] = useState(false)
  const [stats, setStats] = useState<DashboardStats>(emptyStats)
  const [trend, setTrend] = useState<SessionTrendPoint[]>([])
  const [sessionItems, setSessionItems] = useState<SessionListItem[]>([])

  const loadDashboard = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const data = await fetchDashboardHomeData()
      setIsSignedIn(data.signedIn)
      setStats(data.stats)
      setTrend(data.trend)
      setSessionItems(data.sessions)
    } catch (loadError) {
      const message = loadError instanceof Error ? loadError.message : 'Failed to load dashboard.'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadDashboard()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      loadDashboard()
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
        <section className="w-full">
          <h1 className="brand-serif text-xl leading-none tracking-tight text-stone-900 sm:text-2xl md:text-3xl">
            Your Sessions
          </h1>

          {isLoading ? (
            <section className="mt-6 rounded-2xl border border-stone-300/90 bg-stone-50/70 p-5 text-stone-600 md:p-6">
              Loading your dashboard...
            </section>
          ) : error ? (
            <section className="mt-6 rounded-2xl border border-rose-200 bg-rose-50/80 p-5 md:p-6">
              <h2 className="brand-serif text-2xl leading-none text-rose-900 md:text-3xl">Could not load dashboard</h2>
              <p className="mt-2 text-sm text-rose-800">{error}</p>
              <button
                type="button"
                onClick={loadDashboard}
                className="mt-4 rounded-md border border-rose-300 bg-rose-100 px-3.5 py-1.5 text-xs font-medium text-rose-900 transition-colors hover:bg-rose-200"
              >
                Retry
              </button>
            </section>
          ) : !isSignedIn ? (
            <section className="mt-6 rounded-2xl border border-stone-300/90 bg-stone-50/70 p-5 md:p-6">
              <h2 className="brand-serif text-2xl leading-none text-stone-800 md:text-3xl">Sign in to view your sessions</h2>
              <p className="mt-2 text-base text-stone-600 md:text-lg">
                Your dashboard will appear here once you sign in with Google.
              </p>
              <button
                type="button"
                onClick={signInWithGoogle}
                className="mt-4 rounded-md border border-stone-300 bg-stone-50 px-3.5 py-1.5 text-xs font-medium text-stone-700 transition-colors hover:bg-stone-200"
              >
                Sign in
              </button>
            </section>
          ) : (
            <>
              <div className="mt-6 grid grid-cols-2 gap-5 md:grid-cols-3 md:gap-7">
                <div>
                  <p className="text-xs text-stone-500">Sessions</p>
                  <p className="brand-serif mt-1.5 text-2xl leading-none font-normal text-stone-900 md:text-3xl">
                    {stats.sessions}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-stone-500">Average Score</p>
                  <p className="brand-serif mt-1.5 text-2xl leading-none font-normal text-stone-900 md:text-3xl">
                    <span>{stats.avgScore.toFixed(1)}</span>
                    <span className="ml-1.5 text-lg text-stone-500 md:text-xl">/ {stats.maxScore}</span>
                  </p>
                </div>
                <div className="col-span-2 md:col-span-1">
                  <p className="text-xs text-stone-500">Total Time ArticuLeeted</p>
                  <p className="brand-serif mt-1.5 text-2xl leading-none font-normal text-stone-900 md:text-3xl">
                    {stats.totalMinutes}m
                  </p>
                </div>
              </div>

              {sessionItems.length === 0 && (
                <section className="mt-6 rounded-2xl border border-stone-300/90 bg-stone-50/70 p-5 md:p-6">
                  <h2 className="brand-serif text-2xl leading-none text-stone-800 md:text-3xl">No sessions yet</h2>
                  <p className="mt-2 text-base text-stone-600 md:text-lg">
                    Complete your first interview session and it will appear here.
                  </p>
                </section>
              )}

              <article className="mt-8 rounded-2xl border border-stone-300/90 bg-stone-50/85 px-4 pb-4 pt-5 shadow-[0_1px_0_rgba(0,0,0,0.02)] sm:px-5 sm:pb-5 md:mt-10 md:px-6 md:pb-6">
                <p className="brand-serif text-lg leading-none text-stone-600 md:text-xl">Last 5 sessions</p>

                {trend.length > 0 ? (
                  <div className="mt-4 h-44 w-full md:h-48">
                    <ChartContainer config={chartConfig} className="h-full w-full">
                      <AreaChart
                        accessibilityLayer
                        data={trend}
                        margin={{ top: 18, right: 12, left: -14, bottom: 4 }}
                      >
                        <defs>
                          <linearGradient id="scoreFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="var(--color-score)" stopOpacity={0.22} />
                            <stop offset="100%" stopColor="var(--color-score)" stopOpacity={0.03} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid vertical={false} stroke="rgb(214 211 209)" strokeDasharray="4 4" />
                        <XAxis
                          dataKey="date"
                          axisLine={false}
                          tickLine={false}
                          tickMargin={10}
                          interval={0}
                          className="text-xs text-stone-500"
                        />
                        <YAxis
                          domain={[0, 4]}
                          ticks={[0, 2, 4]}
                          axisLine={false}
                          tickLine={false}
                          tickMargin={8}
                          className="text-xs text-stone-500"
                        />
                        <ChartTooltip
                          cursor={false}
                          content={<ChartTooltipContent labelKey="date" />}
                        />
                        <Area
                          dataKey="score"
                          type="monotone"
                          fill="url(#scoreFill)"
                          fillOpacity={1}
                          stroke="var(--color-score)"
                          strokeWidth={1.8}
                          dot={{ r: 3.2, fill: 'var(--color-score)', stroke: 'var(--color-score)' }}
                          activeDot={{ r: 4, fill: 'var(--color-score)' }}
                        />
                      </AreaChart>
                    </ChartContainer>
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-stone-600">
                    No scored sessions yet. Your trend chart will appear after your first scored run.
                  </p>
                )}
              </article>

              <SessionList items={sessionItems} className="mt-6 md:mt-7" />
            </>
          )}
        </section>
      </main>
    </div>
  )
}

export default Dashboard
