import { useState } from 'react'
import { Maximize2, Trash2 } from 'lucide-react'
import type { GenerateResult } from '../types'
import ImageComparison from './ImageComparison'
import ImageViewer from './ImageViewer'

interface ResultDisplayProps {
  result: GenerateResult
  onClear?: () => void
  onDelete?: () => void
}

export default function ResultDisplay({ result, onClear, onDelete }: ResultDisplayProps) {
  const [showComparison, setShowComparison] = useState(false)
  const [showViewer, setShowViewer] = useState(false)

  if (!result.success) {
    return (
      <div className="bg-red-900/30 border border-red-800 rounded-lg p-4">
        <p className="text-red-400 text-sm">{result.error}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {result.image_url && (
        <div className="max-h-[70vh] flex justify-center">
          <div className="relative cursor-pointer group inline-block" onClick={() => setShowViewer(true)}>
            <img
              src={result.image_url}
              alt="Generated wallpaper"
              className="max-h-[70vh] w-auto rounded-lg object-contain block"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition rounded-lg flex items-center justify-center">
              <Maximize2 className="opacity-0 group-hover:opacity-100 transition text-white" size={24} />
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-4 text-sm text-gray-400">
        {result.target_resolution && (
          <span>{result.target_resolution[0]}x{result.target_resolution[1]}</span>
        )}
        {result.seed_used !== null && result.seed_used >= 0 && (
          <span>Seed: {result.seed_used}</span>
        )}
      </div>

      <div className="flex gap-2">
        {result.image_url && (
          <a
            href={result.image_url}
            download={result.filename || 'wallpaper.png'}
            className="bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
          >
            Download PNG
          </a>
        )}
        {result.base_resolution && (
          <button
            onClick={() => setShowComparison(!showComparison)}
            className="bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
          >
            {showComparison ? 'Hide' : 'Compare Base vs Upscaled'}
          </button>
        )}
        {onClear && (
          <button
            onClick={onClear}
            className="bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-gray-300 text-sm font-medium px-4 py-2 rounded-lg transition"
          >
            Clear
          </button>
        )}
        {onDelete && (
          <button
            onClick={onDelete}
            className="bg-gray-800 hover:bg-red-900 text-gray-400 hover:text-red-400 text-sm font-medium px-4 py-2 rounded-lg transition flex items-center gap-1.5"
          >
            <Trash2 size={14} />
            Delete
          </button>
        )}
      </div>

      {showComparison && result.base_resolution && result.target_resolution && (
        <ImageComparison
          baseResolution={result.base_resolution}
          targetResolution={result.target_resolution}
        />
      )}
      {showViewer && result.image_url && (
        <ImageViewer imageUrl={result.image_url} onClose={() => setShowViewer(false)} />
      )}
    </div>
  )
}
