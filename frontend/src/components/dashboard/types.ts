export type SessionListItem = {
  id: string
  problemName: string
  createdAt: string
  totalTimeMinutes: number | null
  scoreOverall: number | null
  problemUrl?: string | null
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
