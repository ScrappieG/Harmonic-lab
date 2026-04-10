import { motion, useReducedMotion, type Variants } from 'framer-motion'
import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowLeft, ChevronDown, ExternalLink, MoreHorizontal, Trash2 } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import type { SessionDetailData } from '@/components/dashboard/types'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { deleteDashboardSession, fetchDashboardSessionDetail } from '@/lib/dashboardData'
import { supabase } from '@/lib/supabase'
import { useDashboardLayoutContext } from './DashboardLayout'

const dateTimeFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
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

function formatDateTimeLabel(createdAt: string) {
  const parsedDate = new Date(createdAt)
  if (Number.isNaN(parsedDate.getTime())) return createdAt
  return dateTimeFormatter.format(parsedDate)
}

function formatMinutes(totalTimeMinutes: number | null) {
  return typeof totalTimeMinutes === 'number' ? `${totalTimeMinutes} mins` : '—'
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

type TranscriptSection = {
  heading: string
  body: string
}

function parseTranscriptSections(transcript: string | null | undefined): TranscriptSection[] {
  if (!transcript) return []

  const normalizedTranscript = transcript.trim()
  if (!normalizedTranscript) return []

  const sectionMatches = Array.from(normalizedTranscript.matchAll(/^##\s+(.+)\n([\s\S]*?)(?=^##\s+.+|\Z)/gm))
  if (sectionMatches.length === 0) {
    return [{ heading: 'Transcript', body: normalizedTranscript }]
  }

  return sectionMatches
    .map((match) => ({
      heading: match[1].trim(),
      body: match[2].trim(),
    }))
    .filter((section) => section.heading && section.body)
}

function TranscriptAccordion({ transcript }: { transcript: string | null | undefined }) {
  const transcriptSections = parseTranscriptSections(transcript)
  if (transcriptSections.length === 0) return null

  return (
    <section className="mt-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="brand-serif text-2xl leading-none text-stone-800 dark:text-stone-100 md:text-3xl">Transcript</h2>
          <p className="mt-2 text-sm leading-relaxed text-stone-500 dark:text-stone-400 md:text-base">
            Expand any section to review how you talked through the problem.
          </p>
        </div>
        <span className="brand-mono rounded-full border border-stone-300/90 bg-stone-50/85 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-stone-500 dark:border-stone-700 dark:bg-stone-900/85 dark:text-stone-400">
          {transcriptSections.length} sections
        </span>
      </div>

      <div className="mt-4 space-y-3">
        {transcriptSections.map((section, index) => (
          <details
            key={`${section.heading}-${index}`}
            className="dashboard-hover-card group overflow-hidden rounded-2xl border border-stone-300/90 bg-stone-50/85 shadow-[0_1px_0_rgba(0,0,0,0.02)] open:border-lime-900/30 open:bg-lime-50/65 dark:border-stone-800 dark:bg-stone-900/80 dark:open:border-lime-700/35 dark:open:bg-stone-900"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-4 marker:content-none md:px-5">
              <div className="min-w-0">
                <p className="brand-mono text-[11px] uppercase tracking-[0.16em] text-stone-500 dark:text-stone-400">
                  Section {index + 1}
                </p>
                <h3 className="brand-serif mt-1 text-xl leading-tight text-stone-900 dark:text-stone-100 md:text-2xl">
                  {section.heading}
                </h3>
              </div>
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-stone-300/90 bg-stone-100/90 text-stone-500 transition-transform duration-200 group-open:rotate-180 group-open:border-lime-900/20 group-open:text-lime-900 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300 dark:group-open:border-lime-700/35 dark:group-open:text-lime-400">
                <ChevronDown className="size-4" />
              </span>
            </summary>

            <div className="border-t border-stone-300/80 bg-white/55 px-4 py-4 dark:border-stone-800 dark:bg-stone-950/35 md:px-5 md:py-5">
              <p className="text-base leading-relaxed whitespace-pre-wrap text-stone-700 dark:text-stone-200 md:text-lg">
                {section.body}
              </p>
            </div>
          </details>
        ))}
      </div>
    </section>
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
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-stone-500 dark:text-stone-400 md:text-base">
          <span>{formatDateTimeLabel(session.createdAt)}</span>
          <span aria-hidden className="h-4 w-px bg-stone-300 dark:bg-stone-700" />
          <span>{formatMinutes(session.totalTimeMinutes)}</span>
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

        <motion.div
          initial={reduceMotion ? false : 'hidden'}
          animate={reduceMotion ? undefined : 'visible'}
          variants={reduceMotion ? undefined : revealUp}
        >
          <TranscriptAccordion transcript={problemDetails.transcript} />
        </motion.div>
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
  const navigate = useNavigate()
  const { sessionId } = useParams()
  const { dashboardData, reloadDashboard } = useDashboardLayoutContext()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSignedIn, setIsSignedIn] = useState(false)
  const [detail, setDetail] = useState<SessionDetailData | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [isActionsMenuOpen, setIsActionsMenuOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const actionsMenuRef = useRef<HTMLDivElement | null>(null)
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

  useEffect(() => {
    if (!isActionsMenuOpen) return

    const handlePointerDown = (event: MouseEvent) => {
      if (!actionsMenuRef.current?.contains(event.target as Node)) {
        setIsActionsMenuOpen(false)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsActionsMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isActionsMenuOpen])

  const handleDelete = useCallback(async () => {
    if (!detail || !sessionId || isDeleting) return

    setIsDeleting(true)
    setDeleteError(null)

    try {
      await deleteDashboardSession(sessionId)
      setIsDeleteDialogOpen(false)
      setIsActionsMenuOpen(false)
      await reloadDashboard()
      navigate('/dashboard', { replace: true })
    } catch (deleteSessionError) {
      const message = deleteSessionError instanceof Error ? deleteSessionError.message : 'Failed to delete session.'
      setDeleteError(message)
    } finally {
      setIsDeleting(false)
    }
  }, [detail, isDeleting, navigate, reloadDashboard, sessionId])

  const handleOpenProblem = useCallback(() => {
    const problemUrl = detail?.session.problemUrl
    if (!problemUrl) return
    setIsActionsMenuOpen(false)
    window.open(problemUrl, '_blank', 'noopener,noreferrer')
  }, [detail])

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
        <motion.div
          className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"
          initial={reduceMotion ? false : 'hidden'}
          animate={reduceMotion ? undefined : 'visible'}
          variants={reduceMotion ? undefined : revealUp}
        >
          <h1 className="brand-serif text-3xl leading-none tracking-tight text-stone-900 dark:text-stone-100 md:text-4xl">
            {title}
          </h1>
          {detail ? (
            <div className="flex flex-col items-start gap-2 sm:items-end">
              <div ref={actionsMenuRef} className="relative">
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  className="rounded-full border-stone-300 bg-stone-50 text-stone-700 hover:bg-stone-200 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100 dark:hover:bg-stone-800"
                  aria-label="Session actions"
                  aria-haspopup="menu"
                  aria-expanded={isActionsMenuOpen}
                  onClick={() => setIsActionsMenuOpen((currentValue) => !currentValue)}
                >
                  <MoreHorizontal className="size-4" />
                </Button>

                <div
                  className={`absolute right-0 top-full z-20 mt-2 min-w-48 overflow-hidden rounded-xl border border-stone-300/90 bg-stone-50/95 p-1.5 shadow-[0_14px_36px_rgba(20,20,15,0.14)] backdrop-blur-sm transition-opacity dark:border-stone-800 dark:bg-stone-950/95 dark:shadow-[0_16px_40px_rgba(0,0,0,0.4)] ${
                    isActionsMenuOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
                  }`}
                  role="menu"
                  aria-hidden={!isActionsMenuOpen}
                >
                  <button
                    type="button"
                    onClick={handleOpenProblem}
                    disabled={!detail.session.problemUrl}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-stone-700 transition-colors hover:bg-stone-200/70 disabled:cursor-not-allowed disabled:text-stone-400 disabled:hover:bg-transparent dark:text-stone-200 dark:hover:bg-stone-800/80 dark:disabled:text-stone-500"
                  >
                    <ExternalLink className="size-4" />
                    Open problem
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsActionsMenuOpen(false)
                      setIsDeleteDialogOpen(true)
                    }}
                    disabled={isDeleting}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-rose-700 transition-colors hover:bg-rose-50 disabled:cursor-not-allowed disabled:text-rose-400 disabled:hover:bg-transparent dark:text-rose-300 dark:hover:bg-rose-950/40 dark:disabled:text-rose-500"
                  >
                    <Trash2 className="size-4" />
                    {isDeleting ? 'Deleting...' : 'Delete session'}
                  </button>
                </div>
              </div>
              {deleteError ? (
                <p className="max-w-xs text-sm text-rose-700 dark:text-rose-300">{deleteError}</p>
              ) : null}
              <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete session?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently remove{' '}
                      <span className="font-medium text-stone-800 dark:text-stone-200">
                        {detail.session.problemName ?? 'this session'}
                      </span>
                      {' '}and its saved results. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel asChild>
                      <Button type="button" variant="ghost" className="text-stone-700 dark:text-stone-200">
                        Cancel
                      </Button>
                    </AlertDialogCancel>
                    <AlertDialogAction asChild>
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={() => void handleDelete()}
                        disabled={isDeleting}
                      >
                        <Trash2 className="size-4" />
                        {isDeleting ? 'Deleting...' : 'Delete session'}
                      </Button>
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          ) : null}
        </motion.div>
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
