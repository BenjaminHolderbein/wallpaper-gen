import { useState, useCallback, useRef } from 'react'
import { connectGenerate } from '../api/client'
import type { GenerateProgress, GenerateResult } from '../types'

type Status = 'idle' | 'generating' | 'complete' | 'error'

export function useGenerate() {
  const [status, setStatus] = useState<Status>('idle')
  const [progress, setProgress] = useState<GenerateProgress | null>(null)
  const [result, setResult] = useState<GenerateResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const wsRef = useRef<WebSocket | null>(null)

  const generate = useCallback((request: Record<string, unknown>) => {
    setStatus('generating')
    setProgress(null)
    setResult(null)
    setError(null)

    wsRef.current = connectGenerate(
      request,
      (data) => setProgress(data),
      (data) => {
        setResult(data)
        setStatus(data.success ? 'complete' : 'error')
        if (!data.success && data.error) setError(data.error)
      },
      (err) => {
        setError(err)
        setStatus('error')
      },
    )
  }, [])

  const reset = useCallback(() => {
    setStatus('idle')
    setProgress(null)
    setResult(null)
    setError(null)
  }, [])

  return { status, progress, result, error, generate, reset, isGenerating: status === 'generating' }
}
