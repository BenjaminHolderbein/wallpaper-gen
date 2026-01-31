import { useState, useEffect, useCallback } from 'react'
import { fetchGallery, fetchResolutions, deleteImage } from '../api/client'
import type { GalleryItem, GalleryResponse } from '../types'

export function useGallery() {
  const [items, setItems] = useState<GalleryItem[]>([])
  const [search, setSearch] = useState('')
  const [resolution, setResolution] = useState('')
  const [resolutions, setResolutions] = useState<string[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  const load = useCallback(async () => {
    try {
      const data: GalleryResponse = await fetchGallery({ search, resolution, page, per_page: 15 })
      setItems(data.items)
      setTotalPages(data.total_pages)
      setTotal(data.total)
    } catch {
      // silently fail on gallery load
    }
  }, [search, resolution, page])

  const loadResolutions = useCallback(async () => {
    try {
      setResolutions(await fetchResolutions())
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => { load() }, [load])
  useEffect(() => { loadResolutions() }, [loadResolutions])

  const handleDelete = useCallback(async (filename: string) => {
    await deleteImage(filename)
    load()
    loadResolutions()
  }, [load, loadResolutions])

  const handleSearch = useCallback((value: string) => {
    setSearch(value)
    setPage(1)
  }, [])

  const handleResolution = useCallback((value: string) => {
    setResolution(value)
    setPage(1)
  }, [])

  return {
    items, search, resolution, resolutions, page, totalPages, total,
    setPage, handleSearch, handleResolution, handleDelete, refresh: load,
  }
}
