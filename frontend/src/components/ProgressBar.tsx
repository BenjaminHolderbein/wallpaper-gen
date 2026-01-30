import type { GenerateProgress } from '../types'

interface ProgressBarProps {
  progress: GenerateProgress | null
}

const STAGE_LABELS: Record<string, string> = {
  loading_model: 'Loading Model',
  generating: 'Generating',
  unloading_model: 'Freeing VRAM',
  loading_upscaler: 'Loading Upscaler',
  upscaling: 'Upscaling',
  saving: 'Saving',
  complete: 'Complete',
}

export default function ProgressBar({ progress }: ProgressBarProps) {
  if (!progress) return null

  const percent = Math.round(progress.progress * 100)
  const label = STAGE_LABELS[progress.stage] || progress.stage

  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-gray-400 mb-1">
        <span>{label}</span>
        <span>{percent}%</span>
      </div>
      <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
        <div
          className="bg-indigo-500 h-full rounded-full transition-all duration-200"
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="text-xs text-gray-500 mt-1">{progress.message}</p>
    </div>
  )
}
