import { cn } from '@/lib/utils'

import SessionRow, { type SessionListItem } from './SessionRow'

export type SessionListProps = {
  items: SessionListItem[]
  className?: string
}

function SessionList({ items, className }: SessionListProps) {
  return (
    <section className={cn('overflow-hidden rounded-2xl border border-stone-300/90 bg-stone-50/70', className)}>
      {items.map((item, index) => (
        <SessionRow key={item.id} item={item} isLast={index === items.length - 1} />
      ))}
    </section>
  )
}

export default SessionList
export type { SessionListItem }
