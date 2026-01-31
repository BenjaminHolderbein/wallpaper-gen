import { CircleHelp } from 'lucide-react'
import Tooltip from './Tooltip'

interface PromptFormProps {
  prompt: string
  negativePrompt: string
  onPromptChange: (value: string) => void
  onNegativePromptChange: (value: string) => void
  onGenerate: () => void
  disabled?: boolean
}

export default function PromptForm({
  prompt, negativePrompt, onPromptChange, onNegativePromptChange, onGenerate, disabled,
}: PromptFormProps) {
  return (
    <div className="flex flex-col gap-3">
      <div>
        <label className="text-sm font-medium block mb-1">Prompt</label>
        <textarea
          value={prompt}
          onChange={(e) => onPromptChange(e.target.value)}
          placeholder="Describe the wallpaper you want to generate..."
          disabled={disabled}
          rows={3}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-sm resize-none focus:outline-none focus:border-indigo-500 transition"
        />
      </div>
      <div>
        <label className="text-sm font-medium block mb-1">
          Negative Prompt
          <Tooltip text="Describes what you don't want in the image. The model will try to avoid these concepts during generation."><CircleHelp className="inline text-gray-600 ml-1" size={12} /></Tooltip>
        </label>
        <input
          type="text"
          value={negativePrompt}
          onChange={(e) => onNegativePromptChange(e.target.value)}
          placeholder="blurry, low quality, distorted, deformed, ugly, bad anatomy"
          disabled={disabled}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-indigo-500 transition placeholder-gray-600"
        />
      </div>
      <button
        onClick={onGenerate}
        disabled={disabled || !prompt.trim()}
        className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-medium py-3 rounded-lg transition text-sm"
      >
        {disabled ? 'Generating...' : 'Generate Wallpaper'}
      </button>
    </div>
  )
}
