const URL_PATTERN = /https?:\/\/[^\s]+/gi
const REDNOTE_TAG_PATTERN = /(^|\s)#([\p{L}\p{N}_-]{1,32})/gu

export type HookTemplateId = "aida" | "pas" | "bab"

export const hookTemplates: Array<{
  id: HookTemplateId
  label: string
  description: string
}> = [
  {
    id: "aida",
    label: "AIDA",
    description: "Attention, interest, desire, action.",
  },
  {
    id: "pas",
    label: "PAS",
    description: "Problem, agitation, solution.",
  },
  {
    id: "bab",
    label: "Before-After-Bridge",
    description: "Contrast the old state, new state, and bridge.",
  },
]

export function estimateXWeightedLength(text: string) {
  let total = 0
  let cursor = 0
  const urls: Array<{ start: number; end: number }> = []

  for (const match of text.matchAll(URL_PATTERN)) {
    if (typeof match.index === "number") {
      urls.push({ start: match.index, end: match.index + match[0].length })
    }
  }

  for (const url of urls) {
    total += countWeightedText(text.slice(cursor, url.start))
    total += 23
    cursor = url.end
  }

  total += countWeightedText(text.slice(cursor))

  return {
    count: total,
    limit: 280,
    remaining: 280 - total,
    overLimit: total > 280,
  }
}

export function extractRednoteHashtags(text: string) {
  const seen = new Set<string>()
  const tags: string[] = []

  for (const match of text.matchAll(REDNOTE_TAG_PATTERN)) {
    const value = match[2]?.trim()

    if (!value) {
      continue
    }

    const normalized = value.replace(/[^\p{L}\p{N}_-]/gu, "")
    const key = normalized.toLowerCase()

    if (!normalized || seen.has(key)) {
      continue
    }

    seen.add(key)
    tags.push(normalized)
  }

  return tags.slice(0, 10)
}

export function createHookFromTemplate(template: HookTemplateId, title: string, body: string) {
  const subject = title.trim().replace(/[.!?。！？]+$/, "")
  const firstSentence = body.split(/[.!?。！？]\s/)[0]?.trim() || subject

  if (template === "aida") {
    return `Most teams notice ${subject.toLowerCase()}, but few turn it into a repeatable operating loop.`
  }

  if (template === "pas") {
    return `${firstSentence} The real cost is restarting the workflow every week instead of improving it.`
  }

  return `Before: scattered posts and unclear follow-up. After: one visible loop for ${subject.toLowerCase()}.`
}

function countWeightedText(text: string) {
  let total = 0

  for (const char of Array.from(text)) {
    total += isSingleWeight(char) ? 1 : 2
  }

  return total
}

function isSingleWeight(char: string) {
  const codePoint = char.codePointAt(0) ?? 0

  return (
    codePoint <= 0x10ff ||
    (codePoint >= 0x2000 && codePoint <= 0x200d) ||
    (codePoint >= 0x2010 && codePoint <= 0x201f) ||
    (codePoint >= 0x2032 && codePoint <= 0x2037)
  )
}
