import { fail, ok, validationError } from "@/lib/api/response"
import { carouselGenerateSchema } from "@/lib/domain"
import { ContentNotFoundError, getPostDetail, saveCarouselExport } from "@/lib/repositories/content-repository"
import { generateCarouselSlides } from "@/lib/services/ai-service"
import { renderCarouselPdf } from "@/lib/services/carousel-export-service"
import { putGeneratedObject } from "@/lib/services/storage-service"
import { resolveWorkspace } from "@/lib/workspace"

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const workspace = await resolveWorkspace()
  const { id } = await params
  const body = await request.json().catch(() => ({}))
  const parsed = carouselGenerateSchema.safeParse(body)

  if (!parsed.success) {
    return validationError("Carousel export payload is invalid.")
  }

  let detail
  try {
    detail = await getPostDetail(workspace.workspaceId, id)
  } catch (error) {
    if (error instanceof ContentNotFoundError) {
      return fail(error.code, error.message, { status: 404 })
    }

    throw error
  }

  const title = parsed.data.title ?? detail.post.title
  const generation = await generateCarouselSlides(detail, title)
  const pdf = await renderCarouselPdf(title, generation.data)
  const upload = await putGeneratedObject({
    workspaceId: workspace.workspaceId,
    fileName: `${id}-linkedin-carousel.pdf`,
    contentType: "application/pdf",
    body: pdf,
    purpose: "export",
  })
  const saved = await saveCarouselExport(workspace.workspaceId, {
    id: `carousel_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    postId: id,
    title,
    slides: generation.data,
    s3Key: upload.configured ? upload.key : undefined,
    createdAt: new Date().toISOString(),
  })

  return ok({
    generation,
    export: saved.export,
    mode: saved.mode,
    storage: upload,
    downloadPath: `/api/v1/posts/${id}/carousel/${saved.export.id}`,
    workspace,
  })
}
