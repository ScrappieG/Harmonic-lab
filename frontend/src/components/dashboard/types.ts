export type SessionBase = {
  id: string
  problemName: string | null
  createdAt: string
  userId?: string | null
  totalTimeMinutes: number | null
  problemUrl?: string | null
}

export type SessionListItem = SessionBase & {
  scoreOverall: number | null
}

export type SessionRowProps = {
  item: SessionListItem
  isLast?: boolean
}

export type SessionListProps = {
  items: SessionListItem[]
  className?: string
}

export type DashboardStats = {
  sessions: number
  avgScore: number
  maxScore: number
  totalMinutes: number
}

export type SessionTrendPoint = {
  date: string
  score: number
}

export type SessionScoreData = {
  scoreOverall: number | null
  feedbackOverall: string | null
  scoreComm: number | null
  feedbackComm: string | null
  scorePs: number | null
  feedbackPs: string | null
  pass: boolean | null
  overallTakeaway: string | null
  // Not in current DB schema; temporary UI field for the mock summary card.
  scoreTechnical?: number | null
}

export type SessionProblemDetailsData = {
  code: string | null
  transcript?: string | null
  problemStatement?: string | null
}

export type SessionDetailData = {
  session: SessionBase
  score: SessionScoreData
  problemDetails: SessionProblemDetailsData
}
