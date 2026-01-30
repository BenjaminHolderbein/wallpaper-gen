import type { GalleryItem } from '../types'

interface GalleryCardProps {
  item: GalleryItem
  onView: () => void
  onDelete: () => void
}

function timeAgo(timestamp: string | null): string {
  if (!timestamp) return ''
  const diff = Date.now() - new Date(timestamp).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export default function GalleryCard({ item, onView, onDelete }: GalleryCardProps) {
  const res = item.target_resolution
  const resStr = res ? `${res[0]}x${res[1]}` : ''

  return (
    <div className="bg-gray-900 rounded-lg overflow-hidden group">
      <div className="relative cursor-pointer" onClick={onView}>
        <img
          src={item.image_url}
          alt={item.prompt || 'Generated wallpaper'}
          className="w-full h-48 object-cover"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition flex items-center justify-center">
          <span className="opacity-0 group-hover:opacity-100 transition text-white text-2xl">⤢</span>
        </div>
      </div>
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium truncate flex-1" title={item.prompt || ''}>
            {item.prompt ? item.prompt.slice(0, 80) : 'Untitled'}
          </p>
          <button
            onClick={onDelete}
            className="text-gray-500 hover:text-red-400 transition shrink-0"
            title="Delete"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
        </div>
        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
          {resStr && <span>{resStr}</span>}
          {resStr && item.timestamp && <span>·</span>}
          {item.timestamp && <span>{timeAgo(item.timestamp)}</span>}
        </div>
      </div>
    </div>
  )
}
