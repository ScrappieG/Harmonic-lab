import type { DashboardStats, SessionDetailData, SessionListItem, SessionTrendPoint } from '@/components/dashboard/types'
import { supabase } from '@/lib/supabase'

type SessionRow = {
  id: string
  user_id: string
  problem_name: string | null
  problem_url: string | null
  created_at: string
  total_time: number | null
}

type ScoreRow = {
  session_id: string
  score_overall: number | null
  feedback_overall: string | null
  score_technical: number | null
  feedback_technical: string | null
  score_comm: number | null
  feedback_comm: string | null
  score_ps: number | null
  feedback_ps: string | null
  pass: boolean | null
  overall_takeaway: string | null
}

type ProblemDetailsRow = {
  session_id: string
  code: string | null
  transcript: string | null
  problem_statement: string | null
}

export type DashboardHomeData = {
  signedIn: boolean
  stats: DashboardStats
  trend: SessionTrendPoint[]
  sessions: SessionListItem[]
}

type DashboardDetailData = {
  signedIn: boolean
  detail: SessionDetailData | null
}

const emptyStats: DashboardStats = {
  sessions: 0,
  avgScore: 0,
  maxScore: 4,
  totalMinutes: 0,
}

function mapSessionListItem(session: SessionRow, scoreOverall: number | null): SessionListItem {
  return {
    id: session.id,
    userId: session.user_id,
    problemName: session.problem_name,
    problemUrl: session.problem_url,
    createdAt: session.created_at,
    totalTimeMinutes: session.total_time,
    scoreOverall,
  }
}

function mapSessionDetail(session: SessionRow, score: ScoreRow | null, problemDetails: ProblemDetailsRow | null): SessionDetailData {
  return {
    session: {
      id: session.id,
      userId: session.user_id,
      problemName: session.problem_name,
      problemUrl: session.problem_url,
      createdAt: session.created_at,
      totalTimeMinutes: session.total_time,
    },
    score: {
      scoreOverall: score?.score_overall ?? null,
      feedbackOverall: score?.feedback_overall ?? null,
      scoreTechnical: score?.score_technical ?? null,
      feedbackTechnical: score?.feedback_technical ?? null,
      scoreComm: score?.score_comm ?? null,
      feedbackComm: score?.feedback_comm ?? null,
      scorePs: score?.score_ps ?? null,
      feedbackPs: score?.feedback_ps ?? null,
      pass: score?.pass ?? null,
      overallTakeaway: score?.overall_takeaway ?? null,
    },
    problemDetails: {
      code: problemDetails?.code ?? null,
      transcript: problemDetails?.transcript ?? null,
      problemStatement: problemDetails?.problem_statement ?? null,
    },
  }
}

function isInvalidUuidError(errorCode: string | undefined) {
  return errorCode === '22P02'
}

export async function fetchDashboardHomeData(): Promise<DashboardHomeData> {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      signedIn: false,
      stats: emptyStats,
      trend: [],
      sessions: [],
    }
  }

  const { data: sessionRows, error: sessionError } = await supabase
    .from('sessions')
    .select('id,user_id,problem_name,problem_url,created_at,total_time')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (sessionError) throw sessionError

  const sessions = (sessionRows ?? []) as SessionRow[]
  if (sessions.length === 0) {
    return {
      signedIn: true,
      stats: emptyStats,
      trend: [],
      sessions: [],
    }
  }

  const sessionIds = sessions.map((session) => session.id)
  const { data: scoreRows, error: scoreError } = await supabase
    .from('score')
    .select('session_id,score_overall')
    .in('session_id', sessionIds)

  if (scoreError) throw scoreError

  const scores = (scoreRows ?? []) as Pick<ScoreRow, 'session_id' | 'score_overall'>[]
  const scoreBySession = new Map(scores.map((row) => [row.session_id, row.score_overall]))

  const sessionListItems = sessions.map((session) => mapSessionListItem(session, scoreBySession.get(session.id) ?? null))

  const scoredValues = scores
    .map((score) => score.score_overall)
    .filter((value): value is number => typeof value === 'number')

  const avgScore = scoredValues.length > 0
    ? Number((scoredValues.reduce((sum, value) => sum + value, 0) / scoredValues.length).toFixed(1))
    : 0

  const totalMinutes = sessions.reduce((sum, session) => sum + (session.total_time ?? 0), 0)
  const trend = sessions
    .filter((session) => typeof scoreBySession.get(session.id) === 'number')
    .slice(0, 5)
    .reverse()
    .map((session) => {
      const parsedDate = new Date(session.created_at)
      const date = Number.isNaN(parsedDate.getTime())
        ? session.created_at
        : new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(parsedDate)
      return {
        x: session.id,
        date,
        score: scoreBySession.get(session.id) as number,
      }
    })

  return {
    signedIn: true,
    stats: {
      sessions: sessions.length,
      avgScore,
      maxScore: 4,
      totalMinutes,
    },
    trend,
    sessions: sessionListItems,
  }
}

export async function fetchDashboardSessionDetail(sessionId: string): Promise<DashboardDetailData> {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { signedIn: false, detail: null }
  }

  const { data: sessionRow, error: sessionError } = await supabase
    .from('sessions')
    .select('id,user_id,problem_name,problem_url,created_at,total_time')
    .eq('id', sessionId)
    .maybeSingle()

  if (sessionError) {
    if (isInvalidUuidError(sessionError.code)) {
      return { signedIn: true, detail: null }
    }
    throw sessionError
  }

  if (!sessionRow) {
    return { signedIn: true, detail: null }
  }

  const typedSessionRow = sessionRow as SessionRow
  if (typedSessionRow.user_id !== user.id) {
    return { signedIn: true, detail: null }
  }

  const [{ data: scoreRow, error: scoreError }, { data: detailsRow, error: detailsError }] = await Promise.all([
    supabase
      .from('score')
      .select(
        'session_id,score_overall,feedback_overall,score_technical,feedback_technical,score_comm,feedback_comm,score_ps,feedback_ps,pass,overall_takeaway'
      )
      .eq('session_id', sessionId)
      .maybeSingle(),
    supabase
      .from('problem_details')
      .select('session_id,code,transcript,problem_statement')
      .eq('session_id', sessionId)
      .maybeSingle(),
  ])

  if (scoreError) throw scoreError
  if (detailsError) throw detailsError

  return {
    signedIn: true,
    detail: mapSessionDetail(typedSessionRow, (scoreRow as ScoreRow | null) ?? null, (detailsRow as ProblemDetailsRow | null) ?? null),
  }
}

export async function deleteDashboardSession(sessionId: string): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('You must be signed in to delete a session.')
  }

  const { error } = await supabase
    .from('sessions')
    .delete()
    .eq('id', sessionId)
    .eq('user_id', user.id)

  if (error) throw error
}
