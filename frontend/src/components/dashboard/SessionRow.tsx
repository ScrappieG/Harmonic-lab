import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'

import { cn } from '@/lib/utils'
import type { SessionRowProps } from './types'

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
})

function formatDateLabel(createdAt: string) {
  const parsedDate = new Date(createdAt)
  if (Number.isNaN(parsedDate.getTime())) return createdAt
  return dateFormatter.format(parsedDate)
}

function formatTimeLabel(totalTimeMinutes: number | null) {
  return typeof totalTimeMinutes === 'number' ? `${totalTimeMinutes}m` : '—'
}

function formatScoreLabel(scoreOverall: number | null) {
  return typeof scoreOverall === 'number' ? scoreOverall.toFixed(1) : '—'
}

function getDotClass(scoreOverall: number | null, dotIndex: number) {
  if (typeof scoreOverall !== 'number') return 'bg-stone-300 dark:bg-stone-700'

  const normalizedScore = Math.max(0, Math.min(4, scoreOverall))
  const wholeDots = Math.floor(normalizedScore)
  const fraction = normalizedScore - wholeDots

  if (dotIndex < wholeDots) return 'bg-lime-950/85 dark:bg-lime-600'
  if (dotIndex === wholeDots && fraction >= 0.35) return 'bg-lime-900/55 dark:bg-lime-500/70'
  return 'bg-stone-300 dark:bg-stone-700'
}

function SessionRow({ item, isLast = false }: SessionRowProps) {
  const problemName = item.problemName ?? 'Untitled session'

  return (
    <Link
      to={`/dashboard/${item.id}`}
      className={cn(
        'group flex w-full cursor-pointer items-center justify-between gap-3 px-4 py-4 text-left transition-all duration-300 hover:bg-stone-100/90 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-900/40 dark:hover:bg-stone-800/90 dark:hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] dark:focus-visible:ring-lime-600/40 sm:px-5 sm:py-4',
        !isLast && 'border-b border-stone-300/90 dark:border-stone-800'
      )}
      aria-label={`Session ${problemName}`}
    >
      <div className="min-w-0">
        <p className="truncate text-base leading-tight text-stone-800 transition-transform duration-300 group-hover:translate-x-0.5 dark:text-stone-100 sm:text-lg">
          {problemName}
        </p>
        <p className="mt-1 text-sm text-stone-500 dark:text-stone-400 sm:text-base">
          {formatDateLabel(item.createdAt)} <span aria-hidden>·</span> {formatTimeLabel(item.totalTimeMinutes)}
        </p>
      </div>

      <div className="ml-3 flex shrink-0 items-center gap-3 sm:gap-4">
        <div className="flex items-center gap-1">
          {Array.from({ length: 4 }).map((_, dotIndex) => (
            <span
              key={`${item.id}-dot-${dotIndex}`}
              className={cn(
                'size-2 rounded-full transition-transform duration-300 group-hover:scale-110',
                getDotClass(item.scoreOverall, dotIndex)
              )}
            />
          ))}
        </div>
        <p className="w-8 text-right text-lg leading-none text-stone-500 dark:text-stone-300">{formatScoreLabel(item.scoreOverall)}</p>
        <span className="flex w-4 justify-end overflow-hidden">
          <ArrowUpRight className="size-4 translate-x-[-0.35rem] text-lime-900 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 dark:text-lime-500" />
        </span>
      </div>
    </Link>
  )
}

export default SessionRow
