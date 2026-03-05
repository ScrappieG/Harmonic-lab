import { Link } from 'react-router-dom'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'

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

const chartConfig = {
  score: {
    label: 'Score',
    color: 'rgb(82 97 58)',
  },
} satisfies ChartConfig

function Dashboard() {
  return (
    <div className="min-h-screen bg-stone-100">
      <header className="border-b border-stone-200/90 bg-stone-100/95 backdrop-blur-sm">
        <nav className="layout-shell flex items-center py-3">
          <Link to="/" className="text-xl leading-none tracking-tight text-stone-900">
            <span className="brand-serif">articu</span>
            <span className="brand-mono">Leet</span>
          </Link>

          <button
            type="button"
            className="ml-auto rounded-md border border-stone-300 bg-stone-50 px-4 py-2 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-200"
          >
            Account
          </button>
        </nav>
      </header>

      <main className="layout-shell py-8 md:py-10">
        <section className="w-full">
          <h1 className="brand-serif text-2xl leading-none tracking-tight text-stone-900 sm:text-3xl md:text-4xl">
            Your Sessions
          </h1>

          <div className="mt-8 grid grid-cols-2 gap-6 md:grid-cols-3 md:gap-8">
            <div>
              <p className="text-sm text-stone-500">Sessions</p>
              <p className="brand-serif mt-2 text-3xl leading-none font-normal text-stone-900 md:text-4xl">
                {stats.sessions}
              </p>
            </div>
            <div>
              <p className="text-sm text-stone-500">Average Score</p>
              <p className="brand-serif mt-2 text-3xl leading-none font-normal text-stone-900 md:text-4xl">
                <span>{stats.avgScore.toFixed(1)}</span>
                <span className="ml-2 text-xl text-stone-500 md:text-2xl">/ {stats.maxScore}</span>
              </p>
            </div>
            <div className="col-span-2 md:col-span-1">
              <p className="text-sm text-stone-500">Total Time ArticuLeeted</p>
              <p className="brand-serif mt-2 text-3xl leading-none font-normal text-stone-900 md:text-4xl">
                {stats.totalMinutes}m
              </p>
            </div>
          </div>

          <article className="mt-10 rounded-2xl border border-stone-300/90 bg-stone-50/70 px-4 pb-4 pt-6 sm:px-6 sm:pb-5 md:mt-12 md:px-7 md:pb-7">
            <p className="brand-serif text-xl leading-none text-stone-600 md:text-2xl">Last 5 sessions</p>

            <div className="mt-5 h-52 w-full md:h-56">
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
                    tickMargin={12}
                    interval={0}
                    className="text-sm text-stone-500"
                  />
                  <YAxis
                    domain={[0, 4]}
                    ticks={[0, 2, 4]}
                    axisLine={false}
                    tickLine={false}
                    tickMargin={10}
                    className="text-sm text-stone-500"
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
                    strokeWidth={2}
                    dot={{ r: 4, fill: 'var(--color-score)', stroke: 'var(--color-score)' }}
                    activeDot={{ r: 5, fill: 'var(--color-score)' }}
                  />
                </AreaChart>
              </ChartContainer>
            </div>
          </article>
        </section>
      </main>
    </div>
  )
}

export default Dashboard
