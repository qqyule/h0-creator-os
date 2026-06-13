import { fail } from "@/lib/api/response"
import { getCarouselExport } from "@/lib/repositories/content-repository"
import { renderCarouselPdf } from "@/lib/services/carousel-export-service"
import { resolveWorkspace } from "@/lib/workspace"

export async function GET(_request: Request, { params }: { params: Promise<{ id: string; exportId: string }> }) {
  const workspace = await resolveWorkspace()
  const { id, exportId } = await params
  const exportData = await getCarouselExport(workspace.workspaceId, id, exportId)

  if (!exportData) {
    return fail("EXPORT_NOT_FOUND", "Carousel export could not be found.", { status: 404 })
  }

  const pdf = await renderCarouselPdf(exportData.title, exportData.slides)

  return new Response(pdf, {
    headers: {
      "content-type": "application/pdf",
      "content-disposition": `attachment; filename="${id}-linkedin-carousel.pdf"`,
      "cache-control": "no-store",
    },
  })
}
