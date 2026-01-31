import { useState } from 'react'
import { Check, Copy, Maximize2, Trash2 } from 'lucide-react'
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
  const [copied, setCopied] = useState(false)
  const res = item.target_resolution
  const resStr = res ? `${res[0]}x${res[1]}` : ''

  const handleCopy = () => {
    navigator.clipboard.writeText(item.prompt!)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="bg-gray-900 rounded-lg overflow-hidden group">
      <div className="relative cursor-pointer" onClick={onView}>
        <img
          src={item.image_url}
          alt={item.prompt || 'Generated wallpaper'}
          className="w-full h-48 object-cover"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition flex items-center justify-center">
          <Maximize2 className="opacity-0 group-hover:opacity-100 transition text-white" size={24} />
        </div>
      </div>
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium flex-1" style={{ wordBreak: 'break-word' }}>
            {item.prompt || 'Untitled'}
          </p>
          <div className="flex items-center gap-1 shrink-0">
            {item.prompt && (
              <button
                onClick={handleCopy}
                className={`transition ${copied ? 'text-green-400' : 'text-gray-500 hover:text-indigo-400'}`}
                title={copied ? 'Copied!' : 'Copy prompt'}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </button>
            )}
            <button
              onClick={onDelete}
              className="text-gray-500 hover:text-red-400 transition"
              title="Delete"
            >
              <Trash2 size={16} />
            </button>
          </div>
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
