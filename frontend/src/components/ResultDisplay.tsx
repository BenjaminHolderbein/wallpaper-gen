import { useState } from 'react'
import type { GenerateResult } from '../types'
import ImageComparison from './ImageComparison'

interface ResultDisplayProps {
  result: GenerateResult
}

export default function ResultDisplay({ result }: ResultDisplayProps) {
  const [showComparison, setShowComparison] = useState(false)

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
        <img
          src={result.image_url}
          alt="Generated wallpaper"
          className="w-full rounded-lg"
        />
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
      </div>

      {showComparison && result.base_resolution && result.target_resolution && (
        <ImageComparison
          baseResolution={result.base_resolution}
          targetResolution={result.target_resolution}
        />
      )}
    </div>
  )
}
