import { motion, useReducedMotion, type Variants } from 'framer-motion'
import { useEffect, useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { Area, AreaChart, CartesianGrid, ReferenceArea, ReferenceLine, XAxis, YAxis } from 'recharts'

import SessionList from '@/components/dashboard/SessionList'
import type { DashboardStats, SessionTrendPoint } from '@/components/dashboard/types'
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { supabase } from '@/lib/supabase'
import { useDashboardLayoutContext } from './DashboardLayout'

const chartConfig = {
  score: {
    label: 'Score',
    color: 'rgb(82 97 58)',
  },
} satisfies ChartConfig

const emptyStats: DashboardStats = {
  sessions: 0,
  avgScore: 0,
  maxScore: 4,
  totalMinutes: 0,
}

const revealUp: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 },
  },
}

const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
}

async function signInWithGoogle() {
  await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${window.location.origin}/auth/callback` },
  })
}

function DashboardHomeSkeleton() {
  return (
    <>
      <div className="mt-6 grid grid-cols-2 gap-5 md:grid-cols-3 md:gap-7" aria-hidden="true">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={`dashboard-stat-skeleton-${index}`}>
            <Skeleton className="h-3 w-20 rounded-sm" />
            <Skeleton className="mt-3 h-8 w-24 md:h-9" />
          </div>
        ))}
      </div>

      <article className="mt-8 rounded-2xl border border-stone-300/90 bg-stone-50/85 px-4 pb-4 pt-5 shadow-[0_1px_0_rgba(0,0,0,0.02)] dark:border-stone-800 dark:bg-stone-900/80 dark:shadow-none sm:px-5 sm:pb-5 md:mt-10 md:px-6 md:pb-6">
        <Skeleton className="h-5 w-28" />
        <Skeleton className="mt-4 h-44 w-full rounded-xl md:h-48" />
      </article>

      <section
        className="mt-6 overflow-hidden rounded-2xl border border-stone-300/90 bg-stone-50/70 dark:border-stone-800 dark:bg-stone-900/75 md:mt-7"
        aria-hidden="true"
      >
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={`dashboard-row-skeleton-${index}`}
            className={`flex items-center justify-between gap-3 px-4 py-4 sm:px-5 ${index < 3 ? 'border-b border-stone-300/90 dark:border-stone-800' : ''}`}
          >
            <div className="min-w-0 flex-1">
              <Skeleton className="h-5 w-3/5 max-w-64" />
              <Skeleton className="mt-2 h-4 w-28" />
            </div>
            <div className="ml-3 flex shrink-0 items-center gap-3 sm:gap-4">
              <Skeleton className="h-2 w-11 rounded-full" />
              <Skeleton className="h-5 w-8" />
            </div>
          </div>
        ))}
      </section>
    </>
  )
}

function TrendChart({ trend }: { trend: SessionTrendPoint[] }) {
  const [chartKey, setChartKey] = useState(0)
  const [isChartReady, setIsChartReady] = useState(false)
  const trendSignature = trend.map(({ date, score }) => `${date}:${score}`).join('|')

  useEffect(() => {
    if (trend.length === 0) {
      setIsChartReady(false)
      return
    }

    setIsChartReady(false)
    const animationFrame = window.requestAnimationFrame(() => {
      setChartKey((currentKey) => currentKey + 1)
      setIsChartReady(true)
    })

    return () => {
      window.cancelAnimationFrame(animationFrame)
    }
  }, [trend.length, trendSignature])

  if (!isChartReady) {
    return <Skeleton className="mt-4 h-44 w-full rounded-xl md:h-48" aria-hidden="true" />
  }

  return (
    <div className="mt-4 h-44 w-full md:h-48">
      <ChartContainer config={chartConfig} className="h-full w-full">
        <AreaChart
          key={`dashboard-trend-chart-${chartKey}`}
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
          {trend.length === 1 ? (
            <>
              <ReferenceArea y1={0} y2={trend[0].score} fill="url(#scoreFill)" fillOpacity={1} />
              <ReferenceLine
                y={trend[0].score}
                stroke="var(--color-score)"
                strokeOpacity={0.55}
                strokeWidth={1.8}
              />
            </>
          ) : null}
          <CartesianGrid vertical={false} stroke="rgb(214 211 209)" strokeDasharray="4 4" />
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tickMargin={10}
            interval={0}
            className="text-xs text-stone-500 dark:text-stone-400"
          />
          <YAxis
            domain={[0, 4]}
            ticks={[0, 2, 4]}
            axisLine={false}
            tickLine={false}
            tickMargin={8}
            className="text-xs text-stone-500 dark:text-stone-400"
          />
          <ChartTooltip cursor={false} content={<ChartTooltipContent labelKey="date" />} />
          <Area
            dataKey="score"
            type="monotone"
            fill="url(#scoreFill)"
            fillOpacity={1}
            stroke="var(--color-score)"
            strokeWidth={1.8}
            isAnimationActive
            animationBegin={0}
            animationDuration={900}
            animationEasing="ease-out"
            dot={{ r: 3.2, fill: 'var(--color-score)', stroke: 'var(--color-score)' }}
            activeDot={{ r: 4, fill: 'var(--color-score)' }}
          />
        </AreaChart>
      </ChartContainer>
    </div>
  )
}

function Dashboard() {
  const reduceMotion = useReducedMotion() ?? false
  const { dashboardData, isLoading, error, reloadDashboard } = useDashboardLayoutContext()
  const isSignedIn = dashboardData?.signedIn ?? false
  const stats = dashboardData?.stats ?? emptyStats
  const trend = dashboardData?.trend ?? []
  const sessionItems = dashboardData?.sessions ?? []
  const isRefreshing = isLoading && Boolean(dashboardData)

  return (
    <section className="w-full">
      <motion.h1
        className="brand-serif text-xl leading-none tracking-tight text-stone-900 dark:text-stone-100 sm:text-2xl md:text-3xl"
        initial={reduceMotion ? false : 'hidden'}
        animate={reduceMotion ? undefined : 'visible'}
        variants={reduceMotion ? undefined : revealUp}
      >
        Your Dashboard
      </motion.h1>

      {isLoading && !dashboardData ? (
        <DashboardHomeSkeleton />
      ) : error && !dashboardData ? (
        <section className="mt-6 rounded-2xl border border-rose-200 bg-rose-50/80 p-5 dark:border-rose-900/70 dark:bg-rose-950/50 md:p-6">
          <h2 className="brand-serif text-2xl leading-none text-rose-900 md:text-3xl">Could not load dashboard</h2>
          <p className="mt-2 text-sm text-rose-800 dark:text-rose-200">{error}</p>
          <button
            type="button"
            onClick={reloadDashboard}
            className="mt-4 rounded-md border border-rose-300 bg-rose-100 px-3.5 py-1.5 text-xs font-medium text-rose-900 transition-colors hover:bg-rose-200 dark:border-rose-800 dark:bg-rose-900/50 dark:text-rose-100 dark:hover:bg-rose-900/70"
          >
            Retry
          </button>
        </section>
      ) : !isSignedIn ? (
        <section className="mt-6 rounded-2xl border border-stone-300/90 bg-stone-50/70 p-5 dark:border-stone-800 dark:bg-stone-900/75 md:p-6">
          <h2 className="brand-serif text-2xl leading-none text-stone-800 dark:text-stone-100 md:text-3xl">Sign in to view your sessions</h2>
          <p className="mt-2 text-base text-stone-600 dark:text-stone-400 md:text-lg">
            Your dashboard will appear here once you sign in with Google.
          </p>
          <button
            type="button"
            onClick={signInWithGoogle}
            className="mt-4 rounded-md border border-stone-300 bg-stone-50 px-3.5 py-1.5 text-xs font-medium text-stone-700 transition-colors hover:bg-stone-200 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100 dark:hover:bg-stone-700"
          >
            Sign in
          </button>
        </section>
      ) : (
        <>
          <motion.div
            className="mt-6 grid grid-cols-2 gap-5 md:grid-cols-3 md:gap-7"
            initial={reduceMotion ? false : 'hidden'}
            animate={reduceMotion ? undefined : 'visible'}
            variants={reduceMotion ? undefined : staggerContainer}
          >
            <motion.div variants={reduceMotion ? undefined : revealUp}>
              <p className="text-xs text-stone-500 dark:text-stone-400">Sessions</p>
              <p className="brand-serif mt-1.5 text-2xl leading-none font-normal text-stone-900 dark:text-stone-100 md:text-3xl">
                {stats.sessions}
              </p>
            </motion.div>
            <motion.div variants={reduceMotion ? undefined : revealUp}>
              <p className="text-xs text-stone-500 dark:text-stone-400">Average Score</p>
              <p className="brand-serif mt-1.5 text-2xl leading-none font-normal text-stone-900 dark:text-stone-100 md:text-3xl">
                <span>{stats.avgScore.toFixed(1)}</span>
                <span className="ml-1.5 text-lg text-stone-500 dark:text-stone-400 md:text-xl">/ {stats.maxScore}</span>
              </p>
            </motion.div>
            <motion.div variants={reduceMotion ? undefined : revealUp} className="col-span-2 md:col-span-1">
              <p className="text-xs text-stone-500 dark:text-stone-400">Total Time ArticuLeeted</p>
              <p className="brand-serif mt-1.5 text-2xl leading-none font-normal text-stone-900 dark:text-stone-100 md:text-3xl">
                {stats.totalMinutes}m
              </p>
            </motion.div>
          </motion.div>

          {sessionItems.length > 0 ? (
            <motion.article
              className="dashboard-hover-card mt-8 rounded-2xl border border-stone-300/90 bg-stone-50/85 px-4 pb-4 pt-5 shadow-[0_1px_0_rgba(0,0,0,0.02)] dark:border-stone-800 dark:bg-stone-900/80 dark:shadow-none sm:px-5 sm:pb-5 md:mt-10 md:px-6 md:pb-6"
              initial={reduceMotion ? false : 'hidden'}
              animate={reduceMotion ? undefined : 'visible'}
              variants={reduceMotion ? undefined : revealUp}
            >
                <p className="brand-serif text-lg leading-none text-stone-600 dark:text-stone-300 md:text-xl">Last 5 sessions</p>

                {trend.length > 0 ? (
                  <TrendChart trend={trend} />
                ) : (
                  <p className="mt-4 text-sm text-stone-600 dark:text-stone-400">
                    No scored sessions yet. Your trend chart will appear after your first scored run.
                  </p>
                )}
            </motion.article>
          ) : null}

          <motion.div
            className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between md:mt-9"
            initial={reduceMotion ? false : 'hidden'}
            animate={reduceMotion ? undefined : 'visible'}
            variants={reduceMotion ? undefined : revealUp}
          >
            <h2 className="brand-serif text-2xl leading-none text-stone-800 dark:text-stone-100 md:text-3xl">Session History</h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void reloadDashboard()}
              disabled={isRefreshing}
              className="shrink-0 border-stone-300 bg-stone-50 text-stone-700 hover:bg-stone-200 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100 dark:hover:bg-stone-800"
            >
              <RefreshCw className={isRefreshing ? 'animate-spin' : ''} />
              {isRefreshing ? 'Refreshing...' : 'Refresh sessions'}
            </Button>
          </motion.div>

          {sessionItems.length === 0 ? (
            <section className="mt-6 rounded-2xl border border-stone-300/90 bg-stone-50/70 p-5 dark:border-stone-800 dark:bg-stone-900/75 md:p-6">
              <h2 className="brand-serif text-2xl leading-none text-stone-800 dark:text-stone-100 md:text-3xl">No sessions yet</h2>
              <p className="mt-2 text-base text-stone-600 dark:text-stone-400 md:text-lg">
                Complete your first interview session and it will appear here.
              </p>
            </section>
          ) : (
            <motion.div
              initial={reduceMotion ? false : 'hidden'}
              animate={reduceMotion ? undefined : 'visible'}
              variants={reduceMotion ? undefined : revealUp}
            >
              <SessionList items={sessionItems} className="mt-6 md:mt-7" />
            </motion.div>
          )}
        </>
      )}
    </section>
  )
}

export default Dashboard
