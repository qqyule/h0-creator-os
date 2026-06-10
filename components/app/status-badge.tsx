import type { WorkflowStatus } from "@/lib/domain"
import { cn } from "@/lib/utils"

const statusClass: Record<WorkflowStatus, string> = {
  Idea: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-200",
  Drafting: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-400/30 dark:bg-blue-400/10 dark:text-blue-200",
  Review:
    "border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-400/30 dark:bg-purple-400/10 dark:text-purple-200",
  Scheduled: "border-cyan-200 bg-cyan-50 text-cyan-700 dark:border-cyan-400/30 dark:bg-cyan-400/10 dark:text-cyan-200",
  Published:
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-200",
}

export function StatusBadge({ status, className }: { status: WorkflowStatus; className?: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-md border px-2 py-1 text-xs font-medium", statusClass[status], className)}>
      {status}
    </span>
  )
}
