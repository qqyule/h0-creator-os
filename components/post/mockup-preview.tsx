import { BarChart3, Bookmark, Heart, MessageCircle, Repeat2, ThumbsUp } from "lucide-react"
import type { PlatformVariant } from "@/lib/domain"
import { extractRednoteHashtags } from "@/lib/platform-formatting"

type VisualMockupWorkspaceProps = {
  variant: PlatformVariant
  title: string
  unsupportedLabel: string
}

export function VisualMockupWorkspace({ variant, title, unsupportedLabel }: VisualMockupWorkspaceProps) {
  if (variant.platform === "linkedin") {
    return (
      <PreviewFrame title={title}>
        <article className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
              CO
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">CreatorOS</p>
              <p className="text-xs text-muted-foreground">Content operations workspace</p>
            </div>
          </div>
          <h4 className="mt-4 text-base font-semibold leading-6 text-foreground">{variant.headline}</h4>
          <p className="mt-3 line-clamp-6 whitespace-pre-line text-sm leading-6 text-muted-foreground">{variant.body}</p>
          <button type="button" className="mt-2 text-sm font-medium text-primary">
            See more...
          </button>
          <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-3 text-xs text-muted-foreground">
            <ActionLabel icon={<ThumbsUp className="h-3.5 w-3.5" />} label="Like" />
            <ActionLabel icon={<Heart className="h-3.5 w-3.5" />} label="Celebrate" />
            <ActionLabel icon={<MessageCircle className="h-3.5 w-3.5" />} label="Comment" />
          </div>
        </article>
      </PreviewFrame>
    )
  }

  if (variant.platform === "x") {
    return (
      <PreviewFrame title={title}>
        <article className="mx-auto max-w-sm rounded-[2rem] border border-slate-700 bg-slate-950 p-4 text-slate-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-slate-700" />
            <div>
              <p className="text-sm font-semibold">CreatorOS</p>
              <p className="text-xs text-slate-400">@creatoros</p>
            </div>
          </div>
          <h4 className="mt-4 text-base font-semibold leading-6">{variant.headline}</h4>
          <p className="mt-3 whitespace-pre-line text-sm leading-6 text-slate-300">{variant.body}</p>
          <div className="mt-4 grid grid-cols-4 gap-2 border-t border-slate-800 pt-3 text-xs text-slate-400">
            <ActionLabel icon={<MessageCircle className="h-3.5 w-3.5" />} label="28" />
            <ActionLabel icon={<Repeat2 className="h-3.5 w-3.5" />} label="94" />
            <ActionLabel icon={<Heart className="h-3.5 w-3.5" />} label="412" />
            <ActionLabel icon={<BarChart3 className="h-3.5 w-3.5" />} label="8.2K" />
          </div>
        </article>
      </PreviewFrame>
    )
  }

  if (variant.platform === "rednote") {
    const tags = extractRednoteHashtags(variant.body)

    return (
      <PreviewFrame title={title}>
        <article className="mx-auto max-w-xs rounded-[1.75rem] border border-rose-100 bg-rose-50 p-3 text-rose-950 shadow-sm dark:border-rose-400/20 dark:bg-rose-950/20 dark:text-rose-50">
          <div className="grid grid-cols-2 gap-2">
            <div className="aspect-[3/4] rounded-2xl bg-gradient-to-br from-rose-200 to-orange-100 dark:from-rose-500/30 dark:to-orange-500/20" />
            <div className="grid gap-2">
              <div className="rounded-2xl bg-card p-3">
                <p className="text-xs font-semibold">CreatorOS</p>
                <p className="mt-2 line-clamp-4 text-xs leading-5 text-muted-foreground">{variant.headline}</p>
              </div>
              <div className="rounded-2xl bg-card p-3 text-xs text-muted-foreground">
                {(tags.length ? tags : ["contentops", "workflow", "creator"]).map((tag) => `#${tag}`).join(" ")}
              </div>
            </div>
          </div>
          <p className="mt-3 line-clamp-5 whitespace-pre-line text-sm leading-6">{variant.body}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <span key={tag} className="rounded-full bg-rose-100 px-2 py-1 text-xs font-medium text-rose-700 dark:bg-rose-400/15 dark:text-rose-100">
                #{tag}
              </span>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between rounded-full bg-card px-3 py-2 text-xs text-muted-foreground">
            <ActionLabel icon={<Heart className="h-3.5 w-3.5 text-rose-500" />} label="1.8K" />
            <ActionLabel icon={<Bookmark className="h-3.5 w-3.5" />} label="Save" />
            <span>Comment...</span>
          </div>
        </article>
      </PreviewFrame>
    )
  }

  return (
    <PreviewFrame title={title}>
      <div className="rounded-xl border border-dashed border-border bg-background p-5 text-sm leading-6 text-muted-foreground">
        {unsupportedLabel}
      </div>
    </PreviewFrame>
  )
}

function PreviewFrame({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-muted/30 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</p>
      <div className="mt-3">{children}</div>
    </div>
  )
}

function ActionLabel({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      {icon}
      {label}
    </span>
  )
}
