import type { PresetsConfig, GalleryResponse, GenerateProgress, GenerateResult } from '../types'

export async function fetchPresets(): Promise<PresetsConfig> {
  const res = await fetch('/api/config/presets')
  return res.json()
}

export async function fetchBaseResolution(w: number, h: number): Promise<{ base_width: number; base_height: number }> {
  const res = await fetch(`/api/config/base-resolution?w=${w}&h=${h}`)
  return res.json()
}

export async function fetchGallery(params: {
  search?: string
  resolution?: string
  page?: number
  per_page?: number
}): Promise<GalleryResponse> {
  const query = new URLSearchParams()
  if (params.search) query.set('search', params.search)
  if (params.resolution) query.set('resolution', params.resolution)
  if (params.page) query.set('page', String(params.page))
  if (params.per_page) query.set('per_page', String(params.per_page))
  const res = await fetch(`/api/gallery?${query}`)
  return res.json()
}

export async function fetchResolutions(): Promise<string[]> {
  const res = await fetch('/api/gallery/resolutions')
  return res.json()
}

export async function deleteImage(filename: string): Promise<void> {
  await fetch(`/api/gallery/${filename}`, { method: 'DELETE' })
}

export function getExportUrl(filenames: string[]): string {
  return `/api/gallery/export?filenames=${filenames.join(',')}`
}

export function connectGenerate(
  request: Record<string, unknown>,
  onProgress: (data: GenerateProgress) => void,
  onComplete: (data: GenerateResult) => void,
  onError: (error: string) => void,
): WebSocket {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  const ws = new WebSocket(`${protocol}//${window.location.host}/ws/generate`)

  ws.onopen = () => {
    ws.send(JSON.stringify(request))
  }

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data)
    if (data.type === 'progress') {
      onProgress(data as GenerateProgress)
    } else if (data.type === 'complete') {
      onComplete(data as GenerateResult)
    } else if (data.type === 'error') {
      onError(data.error)
    }
  }

  ws.onerror = () => {
    onError('WebSocket connection failed')
  }

  return ws
}
