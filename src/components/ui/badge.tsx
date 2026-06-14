import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-barber-500 text-white',
        secondary: 'border-transparent bg-gray-100 dark:bg-dark-300 text-gray-900 dark:text-white',
        destructive: 'border-transparent bg-red-500 text-white',
        outline: 'text-gray-700 dark:text-gray-300',
        success: 'border-transparent bg-green-500 text-white',
        warning: 'border-transparent bg-yellow-500 text-white',
        premium: 'border-transparent bg-gradient-to-r from-barber-500 to-purple-600 text-white',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
