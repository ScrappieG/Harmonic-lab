import type { KeyboardEvent } from 'react'

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
  if (typeof scoreOverall !== 'number') return 'bg-stone-300'

  const normalizedScore = Math.max(0, Math.min(4, scoreOverall))
  const wholeDots = Math.floor(normalizedScore)
  const fraction = normalizedScore - wholeDots

  if (dotIndex < wholeDots) return 'bg-lime-950/85'
  if (dotIndex === wholeDots && fraction >= 0.35) return 'bg-lime-900/55'
  return 'bg-stone-300'
}

function SessionRow({ item, isLast = false }: SessionRowProps) {
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => {}}
      onKeyDown={handleKeyDown}
      className={cn(
        'group flex w-full cursor-pointer items-center justify-between gap-3 px-4 py-4 text-left transition-colors hover:bg-stone-200/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-900/40 sm:px-5 sm:py-4',
        !isLast && 'border-b border-stone-300/90'
      )}
      aria-label={`Session ${item.problemName}`}
    >
      <div className="min-w-0">
        <p className="truncate text-base leading-tight text-stone-800 sm:text-lg">{item.problemName}</p>
        <p className="mt-1 text-sm text-stone-500 sm:text-base">
          {formatDateLabel(item.createdAt)} <span aria-hidden>·</span> {formatTimeLabel(item.totalTimeMinutes)}
        </p>
      </div>

      <div className="ml-3 flex shrink-0 items-center gap-3 sm:gap-4">
        <div className="flex items-center gap-1">
          {Array.from({ length: 4 }).map((_, dotIndex) => (
            <span
              key={`${item.id}-dot-${dotIndex}`}
              className={cn('size-2 rounded-full', getDotClass(item.scoreOverall, dotIndex))}
            />
          ))}
        </div>
        <p className="w-8 text-right text-lg leading-none text-stone-500">{formatScoreLabel(item.scoreOverall)}</p>
      </div>
    </div>
  )
}

export default SessionRow
