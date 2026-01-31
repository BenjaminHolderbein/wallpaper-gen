import { X } from 'lucide-react'

interface ImageViewerProps {
  imageUrl: string
  onClose: () => void
}

export default function ImageViewer({ imageUrl, onClose }: ImageViewerProps) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-8"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white/70 hover:text-white transition"
      >
        <X size={28} />
      </button>
      <img
        src={imageUrl}
        alt="Full size wallpaper"
        className="max-w-full max-h-full object-contain rounded-lg"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  )
}
