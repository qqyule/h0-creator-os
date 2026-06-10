import type { PlatformId } from "@/lib/domain"
import { platformLabels } from "@/lib/domain"
import { PlatformIcon } from "@/components/dashboard/platform-icon"
import { cn } from "@/lib/utils"

export function PlatformPill({ platform, className }: { platform: PlatformId; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2 py-1 text-xs font-medium text-foreground",
        className,
      )}
    >
      <PlatformIcon platform={platform} tile className="h-4 w-4" />
      {platformLabels[platform]}
    </span>
  )
}
