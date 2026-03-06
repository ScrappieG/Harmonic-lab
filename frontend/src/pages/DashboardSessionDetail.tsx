import { ArrowLeft } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'

import { sessionDetailsById } from '@/components/dashboard/mockData'
import type { SessionDetailData } from '@/components/dashboard/types'

const dashboardShellClass = 'mx-auto w-full max-w-5xl px-6 lg:px-8'

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
})

function formatDateLabel(createdAt: string) {
  const parsedDate = new Date(createdAt)
  if (Number.isNaN(parsedDate.getTime())) return createdAt
  return dateFormatter.format(parsedDate)
}

function formatMinutes(totalTimeMinutes: number | null) {
  return typeof totalTimeMinutes === 'number' ? `${totalTimeMinutes}m` : '—'
}

function formatScore(score: number | null) {
  return typeof score === 'number' ? score.toFixed(1) : '—'
}

function renderScoreValue(score: number | null) {
  return (
    <p className="brand-serif mt-1.5 text-xl leading-none text-stone-900 md:text-2xl">
      {formatScore(score)}
      <span className="ml-1 text-base text-stone-500 md:text-lg">/ 4</span>
    </p>
  )
}

function FeedbackCard({
  body,
  accentLabel,
  isLast = false,
}: {
  body: string | null
  accentLabel: string
  isLast?: boolean
}) {
  return (
    <article className={`p-4 md:p-5 ${!isLast ? 'border-b border-stone-300/90' : ''}`}>
      <div>
        <span className="brand-mono whitespace-nowrap rounded-md border border-lime-900/20 bg-lime-900/8 px-2.5 py-1 text-xs uppercase tracking-[0.14em] text-lime-900/75">
          {accentLabel}
        </span>
      </div>
      <p className="mt-3 text-base leading-relaxed text-stone-600 md:text-lg">{body ?? 'No feedback available.'}</p>
    </article>
  )
}

function SessionDetailContent({ detail }: { detail: SessionDetailData }) {
  const { session, score, problemDetails } = detail
  const technicalScore = score.scoreTechnical ?? null

  return (
    <>
      <div className="mt-5">
        <p className="text-xs text-stone-500 md:text-sm">
          {formatDateLabel(session.createdAt)} <span aria-hidden>·</span> {formatMinutes(session.totalTimeMinutes)}{' '}
          <span aria-hidden>·</span> {formatScore(score.scoreOverall)}/4
        </p>
      </div>

      <section className="mt-6 grid grid-cols-2 gap-2.5 md:grid-cols-5 md:gap-3">
        <article className="rounded-2xl border border-stone-300/90 bg-stone-50/70 p-3.5 md:p-4">
          <p className="brand-mono text-xs uppercase tracking-wide text-stone-500">Overall</p>
          {renderScoreValue(score.scoreOverall)}
        </article>
        <article className="rounded-2xl border border-stone-300/90 bg-stone-50/70 p-3.5 md:p-4">
          <p className="brand-mono text-xs uppercase tracking-wide text-stone-500">Technical</p>
          {renderScoreValue(technicalScore)}
        </article>
        <article className="rounded-2xl border border-stone-300/90 bg-stone-50/70 p-3.5 md:p-4">
          <p className="brand-mono text-xs uppercase tracking-wide text-stone-500">Communication</p>
          {renderScoreValue(score.scoreComm)}
        </article>
        <article className="rounded-2xl border border-stone-300/90 bg-stone-50/70 p-3.5 md:p-4">
          <p className="brand-mono text-xs uppercase tracking-wide text-stone-500">Problem Solving</p>
          {renderScoreValue(score.scorePs)}
        </article>
        <article className="rounded-2xl border border-stone-300/90 bg-stone-50/70 p-3.5 md:p-4">
          <p className="brand-mono text-xs uppercase tracking-wide text-stone-500">Outcome</p>
          <p className="brand-serif mt-1.5 text-xl leading-none text-stone-900 md:text-2xl">
            <span className={score.pass ? 'text-lime-900' : 'text-rose-700'}>{score.pass ? 'Pass' : 'Fail'}</span>
          </p>
        </article>
      </section>

      <hr className="mt-8 border-stone-300/90" />

      <section className="mt-8">
        <h2 className="brand-serif text-2xl leading-none text-stone-800 md:text-3xl">Feedback</h2>
        <div className="mt-4 overflow-hidden rounded-2xl border border-stone-300/90 bg-stone-50/70">
          <FeedbackCard
            body={score.feedbackOverall}
            accentLabel="TECHNICAL"
          />
          <FeedbackCard
            body={score.feedbackComm}
            accentLabel="COMMUNICATION"
          />
          <FeedbackCard
            body={score.feedbackPs}
            accentLabel="PROBLEM SOLVING"
            isLast
          />
        </div>
      </section>

      <section className="mt-8 overflow-hidden rounded-2xl border border-lime-900/25 p-4 shadow-[0_10px_30px_rgba(20,20,15,0.06)] md:p-5">
        <p className="brand-serif text-xl leading-none text-lime-800/85 drop-shadow-[0_1px_0_rgba(255,255,255,0.65)] md:text-2xl">
          <span className="mr-2" aria-hidden>
            🔭
          </span>
          Key Insights
        </p>
        <p className="mt-2 text-base leading-relaxed text-stone-700 md:text-lg">
          {score.overallTakeaway ?? 'No takeaway provided.'}
        </p>
      </section>

      <hr className="mt-8 border-stone-300/90" />

      <section className="mt-8 pb-8">
        <h2 className="brand-serif text-2xl leading-none text-stone-800 md:text-3xl">Your Code</h2>

        <article className="mt-4 overflow-hidden rounded-2xl border border-stone-300/90 bg-stone-50/80">
          <div className="flex items-center gap-1.5 border-b border-stone-300/90 bg-stone-200/40 px-4 py-2.5">
            <span className="size-2 rounded-full bg-stone-300" />
            <span className="size-2 rounded-full bg-stone-300" />
            <span className="size-2 rounded-full bg-stone-300" />
          </div>
          <pre className="brand-mono overflow-x-auto p-4 text-[12px] leading-relaxed text-stone-700 md:p-5">
            <code>{problemDetails.code ?? '# No code captured for this session.'}</code>
          </pre>
        </article>
      </section>
    </>
  )
}

function DashboardSessionDetail() {
  const { sessionId } = useParams()
  const detail = sessionId ? sessionDetailsById[sessionId] : undefined
  const title = detail?.session.problemName ?? 'Session'

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-stone-100 via-stone-100 to-stone-200/45">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-16 left-1/2 h-56 w-[48rem] -translate-x-1/2 rounded-full bg-stone-50/70 blur-3xl" />
        <div className="absolute left-0 top-72 h-64 w-64 rounded-full bg-stone-200/55 blur-3xl" />
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
        <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-xs text-stone-500 transition-colors hover:text-lime-900">
          <ArrowLeft className="size-4" />
          <span className="brand-mono text-xs uppercase tracking-wide">Back to sessions</span>
        </Link>

        <h1 className="brand-serif mt-3 text-3xl leading-none tracking-tight text-stone-900 md:text-4xl">{title}</h1>

        {detail ? (
          <SessionDetailContent detail={detail} />
        ) : (
          <section className="mt-6 rounded-2xl border border-stone-300/90 bg-stone-50/70 p-5 md:p-6">
            <h2 className="brand-serif text-2xl leading-none text-stone-800 md:text-3xl">Session not found</h2>
            <p className="mt-2 text-base leading-relaxed text-stone-600 md:text-lg">
              We could not find a session for id <span className="brand-mono text-stone-700">{sessionId ?? 'unknown'}</span>.
            </p>
            <Link
              to="/dashboard"
              className="mt-4 inline-flex items-center gap-1.5 rounded-md border border-stone-300 bg-stone-50 px-3.5 py-1.5 text-xs font-medium text-stone-700 transition-colors hover:bg-stone-200"
            >
              <ArrowLeft className="size-4" />
              Back to sessions
            </Link>
          </section>
        )}
      </main>
    </div>
  )
}

export default DashboardSessionDetail
