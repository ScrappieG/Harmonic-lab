import { Link } from 'react-router-dom'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'

import SessionList, { type SessionListItem } from '@/components/dashboard/SessionList'
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'

type DashboardStats = {
  sessions: number
  avgScore: number
  maxScore: number
  totalMinutes: number
}

type SessionTrendPoint = {
  date: string
  score: number
}

const stats: DashboardStats = {
  sessions: 7,
  avgScore: 3.0,
  maxScore: 4,
  totalMinutes: 158,
}

const sessionTrend: SessionTrendPoint[] = [
  { date: 'Feb 4', score: 3.3 },
  { date: 'Feb 7', score: 2.3 },
  { date: 'Feb 9', score: 3.1 },
  { date: 'Feb 11', score: 2.6 },
  { date: 'Feb 13', score: 2.9 },
]

const sessionListItems: SessionListItem[] = [
  {
    id: 'session-01',
    problemName: 'Design a URL Shortener',
    createdAt: '2026-02-13T10:12:00.000Z',
    totalTimeMinutes: 22,
    scoreOverall: 3.1,
    problemUrl: null,
  },
  {
    id: 'session-02',
    problemName: 'Rate Limiter Architecture',
    createdAt: '2026-02-11T09:40:00.000Z',
    totalTimeMinutes: 18,
    scoreOverall: 2.6,
    problemUrl: null,
  },
  {
    id: 'session-03',
    problemName: 'Message Queue Tradeoffs',
    createdAt: '2026-02-09T15:05:00.000Z',
    totalTimeMinutes: 25,
    scoreOverall: 3.3,
    problemUrl: null,
  },
  {
    id: 'session-04',
    problemName: 'Database Indexing Strategy',
    createdAt: '2026-02-07T13:00:00.000Z',
    totalTimeMinutes: 15,
    scoreOverall: 2.3,
    problemUrl: null,
  },
  {
    id: 'session-05',
    problemName: 'Load Balancer Design',
    createdAt: '2026-02-04T11:10:00.000Z',
    totalTimeMinutes: 30,
    scoreOverall: 3.5,
    problemUrl: null,
  },
  {
    id: 'session-06',
    problemName: 'Caching Layer Design',
    createdAt: '2026-02-02T16:22:00.000Z',
    totalTimeMinutes: 20,
    scoreOverall: 2.8,
    problemUrl: null,
  },
  {
    id: 'session-07',
    problemName: 'API Gateway Patterns',
    createdAt: '2026-01-31T17:30:00.000Z',
    totalTimeMinutes: 28,
    scoreOverall: 3.2,
    problemUrl: null,
  },
]

const chartConfig = {
  score: {
    label: 'Score',
    color: 'rgb(82 97 58)',
  },
} satisfies ChartConfig

const dashboardShellClass = 'mx-auto w-full max-w-5xl px-6 lg:px-8'

function Dashboard() {
  return (
    <div className="min-h-screen bg-stone-100">
      <header className="border-b border-stone-200/90 bg-stone-100/95 backdrop-blur-sm">
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

      <main className={`${dashboardShellClass} py-7 md:py-9`}>
        <section className="w-full">
          <h1 className="brand-serif text-xl leading-none tracking-tight text-stone-900 sm:text-2xl md:text-3xl">
            Your Sessions
          </h1>

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

          <article className="mt-8 rounded-2xl border border-stone-300/90 bg-stone-50/70 px-4 pb-4 pt-5 sm:px-5 sm:pb-5 md:mt-10 md:px-6 md:pb-6">
            <p className="brand-serif text-lg leading-none text-stone-600 md:text-xl">Last 5 sessions</p>

            <div className="mt-4 h-44 w-full md:h-48">
              <ChartContainer config={chartConfig} className="h-full w-full">
                <AreaChart
                  accessibilityLayer
                  data={sessionTrend}
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
          </article>

          <SessionList items={sessionListItems} className="mt-6 md:mt-7" />
        </section>
      </main>
    </div>
  )
}

export default Dashboard
