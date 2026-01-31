import { useState, useEffect } from 'react'
import { useGallery } from '../hooks/useGallery'
import { getExportUrl } from '../api/client'
import GalleryFilters from './GalleryFilters'
import GalleryCard from './GalleryCard'
import Pagination from './Pagination'
import ImageViewer from './ImageViewer'

interface GalleryProps {
  refreshKey?: number
  onLoadConfig?: (item: import('../types').GalleryItem) => void
}

export default function Gallery({ refreshKey, onLoadConfig }: GalleryProps) {
  const {
    items, search, resolution, resolutions, page, totalPages, total,
    setPage, handleSearch, handleResolution, handleDelete, refresh,
  } = useGallery()
  const [viewImage, setViewImage] = useState<string | null>(null)

  // Refresh when parent signals (after generation)
  useEffect(() => {
    if (refreshKey !== undefined && refreshKey > 0) {
      refresh()
    }
  }, [refreshKey, refresh])

  const handleExport = () => {
    const filenames = items.map(i => i.filename)
    if (filenames.length > 0) {
      window.open(getExportUrl(filenames), '_blank')
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <GalleryFilters
        search={search}
        resolution={resolution}
        resolutions={resolutions}
        total={total}
        onSearchChange={handleSearch}
        onResolutionChange={handleResolution}
        onExport={handleExport}
      />

      {items.length === 0 ? (
        <p className="text-gray-500 text-sm text-center py-8">
          {search || resolution ? 'No matching images found.' : 'No wallpapers generated yet.'}
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
          {items.map(item => (
            <GalleryCard
              key={item.filename}
              item={item}
              onView={() => setViewImage(item.image_url)}
              onDelete={() => handleDelete(item.filename)}
              onLoadConfig={onLoadConfig ? () => onLoadConfig(item) : undefined}
            />
          ))}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      {viewImage && (
        <ImageViewer imageUrl={viewImage} onClose={() => setViewImage(null)} />
      )}
    </div>
  )
}
