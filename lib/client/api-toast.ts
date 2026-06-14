"use client"

import { toast } from "sonner"

export type ClientApiResponse<T> =
  | { ok: true; data: T; traceId?: string }
  | { ok: false; error?: { code?: string; message?: string }; traceId?: string }

export async function readApiJson<T>(response: Response, fallbackMessage: string): Promise<ClientApiResponse<T>> {
  const payload = (await response.json().catch(() => null)) as ClientApiResponse<T> | null
  if (payload) {
    return payload
  }

  return {
    ok: false,
    error: { message: fallbackMessage },
  }
}

export function toastApiError(result: { error?: { message?: string } } | null | undefined, fallbackMessage: string) {
  toast.error(result?.error?.message ?? fallbackMessage)
}

export function toastSuccess(message: string) {
  toast.success(message)
}

export function toastInfo(message: string) {
  toast.info(message)
}

