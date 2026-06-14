import { cn } from '@/lib/utils'

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-lg bg-gray-200 dark:bg-dark-300', className)}
      {...props}
    />
  )
}

export { Skeleton }
