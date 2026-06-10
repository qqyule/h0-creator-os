import { NextResponse } from "next/server"

export type ApiSuccess<T> = {
  ok: true
  data: T
  traceId?: string
}

export type ApiFailure = {
  ok: false
  error: {
    code: string
    message: string
  }
  traceId?: string
}

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure

export function createTraceId() {
  return `trace_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}

export function ok<T>(data: T, init?: ResponseInit & { traceId?: string }) {
  const { traceId, ...responseInit } = init ?? {}
  return NextResponse.json<ApiSuccess<T>>({ ok: true, data, traceId }, responseInit)
}

export function fail(code: string, message: string, init?: ResponseInit & { traceId?: string }) {
  const { traceId, ...responseInit } = init ?? {}
  return NextResponse.json<ApiFailure>(
    {
      ok: false,
      error: { code, message },
      traceId,
    },
    { status: 400, ...responseInit },
  )
}

export function validationError(message = "The request payload is invalid.", traceId = createTraceId()) {
  return fail("VALIDATION_ERROR", message, { status: 422, traceId })
}

export function serviceUnavailable(message: string, traceId = createTraceId()) {
  return fail("SERVICE_UNCONFIGURED", message, { status: 503, traceId })
}
