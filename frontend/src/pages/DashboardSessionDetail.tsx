import { motion, useReducedMotion, type Variants } from 'framer-motion'
import { useCallback, useEffect, useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'

import type { SessionDetailData } from '@/components/dashboard/types'
import { Skeleton } from '@/components/ui/skeleton'
import { fetchDashboardSessionDetail } from '@/lib/dashboardData'
import { supabase } from '@/lib/supabase'
import { useDashboardLayoutContext } from './DashboardLayout'

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
})

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
    <p className="brand-serif mt-1.5 text-xl leading-none text-stone-900 dark:text-stone-100 md:text-2xl">
      {formatScore(score)}
      <span className="ml-1 text-base text-stone-500 dark:text-stone-400 md:text-lg">/ 4</span>
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
    <article className={`p-4 md:p-5 ${!isLast ? 'border-b border-stone-300/90 dark:border-stone-800' : ''}`}>
      <div>
        <span className="brand-mono whitespace-nowrap rounded-md border border-lime-900/20 bg-lime-900/8 px-2.5 py-1 text-xs uppercase tracking-[0.14em] text-lime-900/75 dark:border-lime-600/25 dark:bg-lime-500/10 dark:text-lime-300">
          {accentLabel}
        </span>
      </div>
      <p className="mt-3 text-base leading-relaxed text-stone-600 dark:text-stone-300 md:text-lg">{body ?? 'No feedback available.'}</p>
    </article>
  )
}

function SessionDetailContent({ detail, reduceMotion }: { detail: SessionDetailData; reduceMotion: boolean }) {
  const { session, score, problemDetails } = detail

  return (
    <>
      <motion.div
        className="mt-5"
        initial={reduceMotion ? false : 'hidden'}
        animate={reduceMotion ? undefined : 'visible'}
        variants={reduceMotion ? undefined : revealUp}
      >
        <p className="text-xs text-stone-500 dark:text-stone-400 md:text-sm">
          {formatDateLabel(session.createdAt)} <span aria-hidden>·</span> {formatMinutes(session.totalTimeMinutes)}{' '}
          <span aria-hidden>·</span> {formatScore(score.scoreOverall)}/4
        </p>
      </motion.div>

      <motion.section
        className="mt-6 grid grid-cols-2 gap-2.5 md:grid-cols-5 md:gap-3"
        initial={reduceMotion ? false : 'hidden'}
        animate={reduceMotion ? undefined : 'visible'}
        variants={reduceMotion ? undefined : staggerContainer}
      >
        <motion.article variants={reduceMotion ? undefined : revealUp} className="dashboard-hover-card rounded-2xl border border-stone-300/90 bg-stone-50/70 p-3.5 dark:border-stone-800 dark:bg-stone-900/75 md:p-4">
          <p className="brand-mono text-xs uppercase tracking-wide text-stone-500 dark:text-stone-400">Overall</p>
          {renderScoreValue(score.scoreOverall)}
        </motion.article>
        <motion.article variants={reduceMotion ? undefined : revealUp} className="dashboard-hover-card rounded-2xl border border-stone-300/90 bg-stone-50/70 p-3.5 dark:border-stone-800 dark:bg-stone-900/75 md:p-4">
          <p className="brand-mono text-xs uppercase tracking-wide text-stone-500 dark:text-stone-400">Technical</p>
          {renderScoreValue(score.scoreTechnical)}
        </motion.article>
        <motion.article variants={reduceMotion ? undefined : revealUp} className="dashboard-hover-card rounded-2xl border border-stone-300/90 bg-stone-50/70 p-3.5 dark:border-stone-800 dark:bg-stone-900/75 md:p-4">
          <p className="brand-mono text-xs uppercase tracking-wide text-stone-500 dark:text-stone-400">Communication</p>
          {renderScoreValue(score.scoreComm)}
        </motion.article>
        <motion.article variants={reduceMotion ? undefined : revealUp} className="dashboard-hover-card rounded-2xl border border-stone-300/90 bg-stone-50/70 p-3.5 dark:border-stone-800 dark:bg-stone-900/75 md:p-4">
          <p className="brand-mono text-xs uppercase tracking-wide text-stone-500 dark:text-stone-400">Problem Solving</p>
          {renderScoreValue(score.scorePs)}
        </motion.article>
        <motion.article variants={reduceMotion ? undefined : revealUp} className="dashboard-hover-card rounded-2xl border border-stone-300/90 bg-stone-50/70 p-3.5 dark:border-stone-800 dark:bg-stone-900/75 md:p-4">
          <p className="brand-mono text-xs uppercase tracking-wide text-stone-500 dark:text-stone-400">Outcome</p>
          <p className="brand-serif mt-1.5 text-xl leading-none text-stone-900 dark:text-stone-100 md:text-2xl">
            {score.pass === null ? (
              <span className="text-stone-500 dark:text-stone-400">—</span>
            ) : (
              <span className={score.pass ? 'text-lime-900 dark:text-lime-400' : 'text-rose-700 dark:text-rose-400'}>{score.pass ? 'Pass' : 'Fail'}</span>
            )}
          </p>
        </motion.article>
      </motion.section>

      <hr className="mt-8 border-stone-300/90 dark:border-stone-800" />

      <motion.section
        className="mt-8"
        initial={reduceMotion ? false : 'hidden'}
        animate={reduceMotion ? undefined : 'visible'}
        variants={reduceMotion ? undefined : revealUp}
      >
        <h2 className="brand-serif text-2xl leading-none text-stone-800 dark:text-stone-100 md:text-3xl">Feedback</h2>
        <div className="dashboard-hover-card mt-4 overflow-hidden rounded-2xl border border-stone-300/90 bg-stone-50/70 dark:border-stone-800 dark:bg-stone-900/75">
          <FeedbackCard
            body={score.feedbackTechnical}
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
      </motion.section>

      <motion.section
        className="dashboard-hover-card mt-8 overflow-hidden rounded-2xl border border-lime-900/25 bg-lime-50/55 p-4 shadow-[0_10px_30px_rgba(20,20,15,0.06)] dark:border-lime-700/30 dark:bg-lime-950/25 dark:shadow-none md:p-5"
        initial={reduceMotion ? false : 'hidden'}
        animate={reduceMotion ? undefined : 'visible'}
        variants={reduceMotion ? undefined : revealUp}
      >
        <p className="brand-serif text-xl leading-none text-lime-800/85 drop-shadow-[0_1px_0_rgba(255,255,255,0.65)] dark:text-lime-300 dark:drop-shadow-none md:text-2xl">
          <span className="mr-2" aria-hidden>
            🔭
          </span>
          Key Insights
        </p>
        <p className="mt-2 text-base leading-relaxed text-stone-700 dark:text-stone-200 md:text-lg">
          {score.feedbackOverall ?? 'No overall feedback available.'}
        </p>
      </motion.section>

      <hr className="mt-8 border-stone-300/90 dark:border-stone-800" />

      <motion.section
        className="mt-8 pb-8"
        initial={reduceMotion ? false : 'hidden'}
        animate={reduceMotion ? undefined : 'visible'}
        variants={reduceMotion ? undefined : revealUp}
      >
        <h2 className="brand-serif text-2xl leading-none text-stone-800 dark:text-stone-100 md:text-3xl">Your Code</h2>

        <article className="dashboard-hover-card mt-4 overflow-hidden rounded-2xl border border-stone-300/90 bg-stone-50/80 dark:border-stone-800 dark:bg-stone-900/80">
          <div className="flex items-center gap-1.5 border-b border-stone-300/90 bg-stone-200/40 px-4 py-2.5 dark:border-stone-800 dark:bg-stone-800/70">
            <span className="size-2 rounded-full bg-stone-300 dark:bg-stone-600" />
            <span className="size-2 rounded-full bg-stone-300 dark:bg-stone-600" />
            <span className="size-2 rounded-full bg-stone-300 dark:bg-stone-600" />
          </div>
          <pre className="brand-mono overflow-x-auto p-4 text-[12px] leading-relaxed text-stone-700 dark:text-stone-200 md:p-5">
            <code>{problemDetails.code ?? '# No code captured for this session.'}</code>
          </pre>
        </article>
      </motion.section>
    </>
  )
}

function SessionDetailSkeleton() {
  return (
    <>
      <div className="mt-5" aria-hidden="true">
        <Skeleton className="h-4 w-40 rounded-sm" />
      </div>

      <section className="mt-6 grid grid-cols-2 gap-2.5 md:grid-cols-5 md:gap-3" aria-hidden="true">
        {Array.from({ length: 5 }).map((_, index) => (
          <article key={`session-metric-skeleton-${index}`} className="rounded-2xl border border-stone-300/90 bg-stone-50/70 p-3.5 dark:border-stone-800 dark:bg-stone-900/75 md:p-4">
            <Skeleton className="h-3 w-20 rounded-sm" />
            <Skeleton className="mt-3 h-7 w-16 md:h-8" />
          </article>
        ))}
      </section>

      <hr className="mt-8 border-stone-300/90 dark:border-stone-800" />

      <section className="mt-8" aria-hidden="true">
        <Skeleton className="h-8 w-32" />
        <div className="mt-4 overflow-hidden rounded-2xl border border-stone-300/90 bg-stone-50/70 dark:border-stone-800 dark:bg-stone-900/75">
          {Array.from({ length: 3 }).map((_, index) => (
            <article
              key={`session-feedback-skeleton-${index}`}
              className={`p-4 md:p-5 ${index < 2 ? 'border-b border-stone-300/90 dark:border-stone-800' : ''}`}
            >
              <Skeleton className="h-7 w-32 rounded-md" />
              <Skeleton className="mt-3 h-4 w-full" />
              <Skeleton className="mt-2 h-4 w-11/12" />
              <Skeleton className="mt-2 h-4 w-4/5" />
            </article>
          ))}
        </div>
      </section>

      <section
        className="mt-8 overflow-hidden rounded-2xl border border-lime-900/25 p-4 shadow-[0_10px_30px_rgba(20,20,15,0.06)] dark:border-lime-700/30 dark:bg-lime-950/25 dark:shadow-none md:p-5"
        aria-hidden="true"
      >
        <Skeleton className="h-7 w-40" />
        <Skeleton className="mt-3 h-4 w-full" />
        <Skeleton className="mt-2 h-4 w-[92%]" />
        <Skeleton className="mt-2 h-4 w-3/4" />
      </section>

      <hr className="mt-8 border-stone-300/90 dark:border-stone-800" />

      <section className="mt-8 pb-8" aria-hidden="true">
        <Skeleton className="h-8 w-32" />

        <article className="mt-4 overflow-hidden rounded-2xl border border-stone-300/90 bg-stone-50/80 dark:border-stone-800 dark:bg-stone-900/80">
          <div className="flex items-center gap-1.5 border-b border-stone-300/90 bg-stone-200/40 px-4 py-2.5 dark:border-stone-800 dark:bg-stone-800/70">
            <span className="size-2 rounded-full bg-stone-300 dark:bg-stone-600" />
            <span className="size-2 rounded-full bg-stone-300 dark:bg-stone-600" />
            <span className="size-2 rounded-full bg-stone-300 dark:bg-stone-600" />
          </div>
          <div className="p-4 md:p-5">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="mt-2 h-4 w-[96%]" />
            <Skeleton className="mt-2 h-4 w-[90%]" />
            <Skeleton className="mt-2 h-4 w-[94%]" />
            <Skeleton className="mt-2 h-4 w-[88%]" />
            <Skeleton className="mt-2 h-4 w-[91%]" />
            <Skeleton className="mt-2 h-4 w-2/3" />
          </div>
        </article>
      </section>
    </>
  )
}

function DashboardSessionDetail() {
  const reduceMotion = useReducedMotion() ?? false
  const { sessionId } = useParams()
  const { dashboardData } = useDashboardLayoutContext()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSignedIn, setIsSignedIn] = useState(false)
  const [detail, setDetail] = useState<SessionDetailData | null>(null)
  const title = detail?.session.problemName ?? 'Session'

  const loadDetail = useCallback(async () => {
    if (!sessionId) {
      setIsSignedIn(true)
      setDetail(null)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const data = await fetchDashboardSessionDetail(sessionId)
      setIsSignedIn(data.signedIn)
      setDetail(data.detail)
    } catch (loadError) {
      const message = loadError instanceof Error ? loadError.message : 'Failed to load session.'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [sessionId])

  useEffect(() => {
    void loadDetail()
  }, [loadDetail])

  useEffect(() => {
    if (dashboardData?.signedIn === false) {
      setIsSignedIn(false)
      setDetail(null)
      setError(null)
      setIsLoading(false)
    }
  }, [dashboardData])

  return (
    <>
      <motion.div
        initial={reduceMotion ? false : 'hidden'}
        animate={reduceMotion ? undefined : 'visible'}
        variants={reduceMotion ? undefined : revealUp}
      >
        <Link to=".." relative="path" className="inline-flex items-center gap-1.5 text-xs text-stone-500 transition-colors hover:text-lime-900 dark:text-stone-400 dark:hover:text-lime-400">
          <ArrowLeft className="size-4" />
          <span className="brand-mono text-xs uppercase tracking-wide">Back to sessions</span>
        </Link>
      </motion.div>

      {isLoading ? (
        <Skeleton className="mt-3 h-10 w-56 max-w-full rounded-md md:h-12" aria-hidden="true" />
      ) : (
        <motion.h1
          className="brand-serif mt-3 text-3xl leading-none tracking-tight text-stone-900 dark:text-stone-100 md:text-4xl"
          initial={reduceMotion ? false : 'hidden'}
          animate={reduceMotion ? undefined : 'visible'}
          variants={reduceMotion ? undefined : revealUp}
        >
          {title}
        </motion.h1>
      )}

      {isLoading ? (
        <SessionDetailSkeleton />
      ) : error ? (
        <section className="mt-6 rounded-2xl border border-rose-200 bg-rose-50/80 p-5 dark:border-rose-900/70 dark:bg-rose-950/50 md:p-6">
          <h2 className="brand-serif text-2xl leading-none text-rose-900 md:text-3xl">Could not load session</h2>
          <p className="mt-2 text-sm text-rose-800 dark:text-rose-200">{error}</p>
          <button
            type="button"
            onClick={loadDetail}
            className="mt-4 rounded-md border border-rose-300 bg-rose-100 px-3.5 py-1.5 text-xs font-medium text-rose-900 transition-colors hover:bg-rose-200 dark:border-rose-800 dark:bg-rose-900/50 dark:text-rose-100 dark:hover:bg-rose-900/70"
          >
            Retry
          </button>
        </section>
      ) : !isSignedIn ? (
        <section className="mt-6 rounded-2xl border border-stone-300/90 bg-stone-50/70 p-5 dark:border-stone-800 dark:bg-stone-900/75 md:p-6">
          <h2 className="brand-serif text-2xl leading-none text-stone-800 dark:text-stone-100 md:text-3xl">Sign in to view your sessions</h2>
          <p className="mt-2 text-base text-stone-600 dark:text-stone-400 md:text-lg">
            This session detail page is available after signing in with Google.
          </p>
          <button
            type="button"
            onClick={() =>
              supabase.auth.signInWithOAuth({
                provider: 'google',
                options: { redirectTo: `${window.location.origin}/auth/callback` },
              })
            }
            className="mt-4 rounded-md border border-stone-300 bg-stone-50 px-3.5 py-1.5 text-xs font-medium text-stone-700 transition-colors hover:bg-stone-200 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100 dark:hover:bg-stone-700"
          >
            Sign in
          </button>
        </section>
      ) : detail ? (
        <SessionDetailContent detail={detail} reduceMotion={reduceMotion} />
      ) : (
        <section className="mt-6 rounded-2xl border border-stone-300/90 bg-stone-50/70 p-5 dark:border-stone-800 dark:bg-stone-900/75 md:p-6">
          <h2 className="brand-serif text-2xl leading-none text-stone-800 dark:text-stone-100 md:text-3xl">Session not found</h2>
          <p className="mt-2 text-base leading-relaxed text-stone-600 dark:text-stone-400 md:text-lg">
            We could not find a session for id <span className="brand-mono text-stone-700 dark:text-stone-200">{sessionId ?? 'unknown'}</span>.
          </p>
          <Link
            to=".."
            relative="path"
            className="mt-4 inline-flex items-center gap-1.5 rounded-md border border-stone-300 bg-stone-50 px-3.5 py-1.5 text-xs font-medium text-stone-700 transition-colors hover:bg-stone-200 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100 dark:hover:bg-stone-700"
          >
            <ArrowLeft className="size-4" />
            Back to sessions
          </Link>
        </section>
      )}
    </>
  )
}

export default DashboardSessionDetail
