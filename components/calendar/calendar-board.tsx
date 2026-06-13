"use client"

import Link from "next/link"
import { useMemo, useState, useTransition } from "react"
import { DndContext, KeyboardSensor, PointerSensor, useDraggable, useDroppable, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core"
import { ChevronRight, GripVertical, ListChecks } from "lucide-react"
import { PlatformPill } from "@/components/app/platform-pill"
import { StatusBadge } from "@/components/app/status-badge"
import { Button } from "@/components/ui/button"
import type { CreatorTask, Post, WorkflowStatus } from "@/lib/domain"

type ApiResult<T> = {
  ok: boolean
  data?: T
  error?: { message: string }
}

const statuses: WorkflowStatus[] = ["Idea", "Drafting", "Review", "Scheduled", "Published"]

export function CalendarBoard({
  initialPosts,
  tasks,
}: {
  initialPosts: Post[]
  tasks: CreatorTask[]
}) {
  const [posts, setPosts] = useState(initialPosts)
  const [editing, setEditing] = useState<Post | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor))
  const weeks = chunk(posts, 7)
  const tasksByPost = useMemo(() => {
    const map = new Map<string, CreatorTask[]>()

    for (const task of tasks) {
      if (!task.postId || task.status === "done") {
        continue
      }

      map.set(task.postId, [...(map.get(task.postId) ?? []), task])
    }

    return map
  }, [tasks])

  function applyPost(post: Post) {
    setPosts((current) =>
      current
        .map((item) => (item.id === post.id ? post : item))
        .sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate)),
    )
  }

  function updateSchedule(post: Post, payload: { scheduledDate: string; scheduledTime: string; timezone: string; status?: WorkflowStatus }) {
    setMessage(null)
    startTransition(async () => {
      const response = await fetch(`/api/v1/posts/${post.id}/schedule`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...payload, version: post.version }),
      })
      const result = (await response.json()) as ApiResult<{ post: Post }>

      if (!result.ok || !result.data) {
        setMessage(result.error?.message ?? "Schedule could not be updated.")
        return
      }

      applyPost(result.data.post)
      setEditing(null)
      setMessage("Schedule updated.")
    })
  }

  function handleDragEnd(event: DragEndEvent) {
    const post = posts.find((item) => item.id === event.active.id)
    const date = String(event.over?.id ?? "")

    if (!post || !date || date === post.scheduledDate) {
      return
    }

    updateSchedule(post, {
      scheduledDate: date,
      scheduledTime: post.scheduledTime ?? "09:00",
      timezone: post.timezone ?? "America/Los_Angeles",
      status: post.status,
    })
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="grid gap-4">
        {message ? <p className="text-sm text-muted-foreground" role="status">{message}</p> : null}
        {weeks.map((week, index) => (
          <div key={index} className="grid gap-3 md:grid-cols-7">
            {week.map((post) => (
              <CalendarCell key={post.id} post={post}>
                <DraggablePostCard
                  post={post}
                  taskCount={tasksByPost.get(post.id)?.length ?? 0}
                  disabled={isPending}
                  onEdit={() => setEditing(post)}
                />
              </CalendarCell>
            ))}
          </div>
        ))}
      </div>
      {editing ? (
        <ScheduleDialog
          post={editing}
          disabled={isPending}
          onClose={() => setEditing(null)}
          onSubmit={(payload) => updateSchedule(editing, payload)}
        />
      ) : null}
    </DndContext>
  )
}

function CalendarCell({ post, children }: { post: Post; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id: post.scheduledDate })

  return (
    <div ref={setNodeRef} className={`min-h-40 rounded-xl border border-border bg-background p-2 ${isOver ? "ring-3 ring-ring/25" : ""}`}>
      {children}
    </div>
  )
}

function DraggablePostCard({
  post,
  taskCount,
  disabled,
  onEdit,
}: {
  post: Post
  taskCount: number
  disabled: boolean
  onEdit: () => void
}) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: post.id })

  return (
    <article
      ref={setNodeRef}
      style={{ transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined }}
      className="flex h-full flex-col rounded-lg border border-border bg-card p-3 shadow-sm"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-sm font-semibold text-foreground">{Number(post.scheduledDate.slice(-2))}</span>
        <button type="button" className="rounded-md p-1 text-muted-foreground hover:bg-muted" aria-label="Drag post" {...attributes} {...listeners}>
          <GripVertical className="h-4 w-4" />
        </button>
      </div>
      <Link href={`/post/${post.id}`} className="mt-3 line-clamp-3 text-sm font-medium leading-5 text-foreground hover:underline">
        {post.title}
      </Link>
      <p className="mt-2 text-xs text-muted-foreground">{post.scheduledTime ?? "09:00"} · {post.format}</p>
      <div className="mt-auto flex flex-wrap gap-2 pt-3">
        <PlatformPill platform={post.primaryPlatform} />
        <StatusBadge status={post.status} />
        {taskCount ? (
          <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
            <ListChecks className="h-3 w-3" />
            {taskCount}
          </span>
        ) : null}
      </div>
      <Button type="button" variant="outline" size="sm" className="mt-3" disabled={disabled} onClick={onEdit}>
        Edit
        <ChevronRight data-icon="inline-end" />
      </Button>
    </article>
  )
}

function ScheduleDialog({
  post,
  disabled,
  onClose,
  onSubmit,
}: {
  post: Post
  disabled: boolean
  onClose: () => void
  onSubmit: (payload: { scheduledDate: string; scheduledTime: string; timezone: string; status?: WorkflowStatus }) => void
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-background/70 p-4 backdrop-blur-sm">
      <form
        className="w-full max-w-md rounded-2xl border border-border bg-card p-5 shadow-xl"
        onSubmit={(event) => {
          event.preventDefault()
          const formData = new FormData(event.currentTarget)
          onSubmit({
            scheduledDate: String(formData.get("scheduledDate") ?? post.scheduledDate),
            scheduledTime: String(formData.get("scheduledTime") ?? post.scheduledTime ?? "09:00"),
            timezone: String(formData.get("timezone") ?? post.timezone ?? "America/Los_Angeles"),
            status: String(formData.get("status") ?? post.status) as WorkflowStatus,
          })
        }}
      >
        <h2 className="text-base font-semibold text-foreground">Edit schedule</h2>
        <p className="mt-1 text-sm text-muted-foreground">{post.title}</p>
        <div className="mt-4 grid gap-3">
          <input name="scheduledDate" type="date" defaultValue={post.scheduledDate} className="h-10 rounded-lg border border-border bg-background px-3 text-sm" />
          <input name="scheduledTime" type="time" defaultValue={post.scheduledTime ?? "09:00"} className="h-10 rounded-lg border border-border bg-background px-3 text-sm" />
          <input name="timezone" defaultValue={post.timezone ?? "America/Los_Angeles"} className="h-10 rounded-lg border border-border bg-background px-3 text-sm" />
          <select name="status" defaultValue={post.status} className="h-10 rounded-lg border border-border bg-background px-3 text-sm">
            {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
          </select>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={disabled}>Save</Button>
        </div>
      </form>
    </div>
  )
}

function chunk<T>(items: T[], size: number) {
  const result: T[][] = []

  for (let index = 0; index < items.length; index += size) {
    result.push(items.slice(index, index + size))
  }

  return result
}
