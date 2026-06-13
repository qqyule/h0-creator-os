import "server-only"

import { PDFDocument, type PDFFont, type PDFPage, type RGB, StandardFonts, rgb } from "pdf-lib"
import type { CarouselSlide } from "@/lib/domain"

const PAGE_WIDTH = 1080
const PAGE_HEIGHT = 1080
const MARGIN = 96

export async function renderCarouselPdf(title: string, slides: CarouselSlide[]) {
  const pdf = await PDFDocument.create()
  const titleFont = await pdf.embedFont(StandardFonts.HelveticaBold)
  const bodyFont = await pdf.embedFont(StandardFonts.Helvetica)

  for (const [index, slide] of slides.entries()) {
    const page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT])
    page.drawRectangle({
      x: 0,
      y: 0,
      width: PAGE_WIDTH,
      height: PAGE_HEIGHT,
      color: rgb(0.97, 0.98, 1),
    })
    page.drawText(`CreatorOS / ${index + 1} of ${slides.length}`, {
      x: MARGIN,
      y: PAGE_HEIGHT - MARGIN,
      size: 28,
      font: bodyFont,
      color: rgb(0.35, 0.38, 0.45),
    })
    drawLines(page, wrapText(slide.title, 24), {
      x: MARGIN,
      y: PAGE_HEIGHT - 220,
      size: 54,
      lineHeight: 66,
      font: titleFont,
      color: rgb(0.08, 0.1, 0.16),
    })
    drawLines(page, wrapText(slide.body, 42), {
      x: MARGIN,
      y: PAGE_HEIGHT - 430,
      size: 34,
      lineHeight: 48,
      font: bodyFont,
      color: rgb(0.19, 0.22, 0.3),
    })
    page.drawText(title, {
      x: MARGIN,
      y: MARGIN,
      size: 24,
      font: bodyFont,
      color: rgb(0.35, 0.38, 0.45),
    })
  }

  return pdf.save()
}

function drawLines(
  page: PDFPage,
  lines: string[],
  options: { x: number; y: number; size: number; lineHeight: number; font: PDFFont; color: RGB },
) {
  lines.forEach((line, index) => {
    page.drawText(line, {
      ...options,
      y: options.y - index * options.lineHeight,
    })
  })
}

function wrapText(text: string, maxLength: number) {
  const lines: string[] = []
  let current = ""

  for (const word of text.split(/\s+/)) {
    const next = current ? `${current} ${word}` : word

    if (next.length > maxLength && current) {
      lines.push(current)
      current = word
    } else {
      current = next
    }
  }

  if (current) {
    lines.push(current)
  }

  return lines.slice(0, 8)
}
