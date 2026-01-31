import { CircleHelp } from 'lucide-react'
import Tooltip from './Tooltip'
import type { PresetsConfig, DevicePreset } from '../types'

interface SettingsProps {
  config: PresetsConfig | null
  disabled?: boolean
  mode: 'preset' | 'custom'
  onModeChange: (mode: 'preset' | 'custom') => void
  selectedPreset: DevicePreset | null
  onPresetChange: (preset: DevicePreset) => void
  customWidth: number
  onCustomWidthChange: (w: number) => void
  customHeight: number
  onCustomHeightChange: (h: number) => void
  steps: number
  onStepsChange: (v: number) => void
  guidance: number
  onGuidanceChange: (v: number) => void
  seed: number
  onSeedChange: (v: number) => void
  seedInput: string
  onSeedInputChange: (v: string) => void
  enableUpscaling: boolean
  onEnableUpscalingChange: (v: boolean) => void
  upscaleModel: string
  onUpscaleModelChange: (v: string) => void
  targetWidth: number
  targetHeight: number
  baseRes: { base_width: number; base_height: number } | null
}

export default function Settings({
  config, disabled,
  mode, onModeChange,
  selectedPreset, onPresetChange,
  customWidth, onCustomWidthChange,
  customHeight, onCustomHeightChange,
  steps, onStepsChange,
  guidance, onGuidanceChange,
  seed, onSeedChange,
  seedInput, onSeedInputChange,
  enableUpscaling, onEnableUpscalingChange,
  upscaleModel, onUpscaleModelChange,
  targetWidth, targetHeight, baseRes,
}: SettingsProps) {
  if (!config) return <div className="p-4 text-gray-400">Loading...</div>

  const allPresets = Object.entries(config.presets)

  return (
    <div className="space-y-3">
      {/* Resolution */}
      <div>
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Resolution</h3>
        <div className="flex gap-2 mb-2">
          <button
            onClick={() => onModeChange('preset')}
            disabled={disabled}
            className={`flex-1 px-3 py-1.5 rounded text-sm font-medium transition ${
              mode === 'preset' ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Preset
          </button>
          <button
            onClick={() => onModeChange('custom')}
            disabled={disabled}
            className={`flex-1 px-3 py-1.5 rounded text-sm font-medium transition ${
              mode === 'custom' ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Custom
          </button>
        </div>

        {mode === 'preset' ? (
          <select
            value={selectedPreset?.name ?? ''}
            onChange={(e) => {
              for (const [, presets] of allPresets) {
                const found = presets.find(p => p.name === e.target.value)
                if (found) { onPresetChange(found); break }
              }
            }}
            disabled={disabled}
            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm"
          >
            {allPresets.map(([category, presets]) => (
              <optgroup key={category} label={category}>
                {presets.map(p => (
                  <option key={p.name} value={p.name}>
                    {p.name} ({p.width}x{p.height})
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        ) : (
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-xs text-gray-400">Width</label>
              <input
                type="number" min={64} max={8192} step={8}
                value={customWidth}
                onChange={(e) => onCustomWidthChange(Number(e.target.value))}
                disabled={disabled}
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs text-gray-400">Height</label>
              <input
                type="number" min={64} max={8192} step={8}
                value={customHeight}
                onChange={(e) => onCustomHeightChange(Number(e.target.value))}
                disabled={disabled}
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm"
              />
            </div>
          </div>
        )}

        <p className="text-xs text-gray-500 mt-2">
          Target: {targetWidth}x{targetHeight}
          {baseRes && ` | Base: ${baseRes.base_width}x${baseRes.base_height}`}
        </p>
      </div>

      <hr className="border-gray-800" />

      {/* Settings */}
      <div>
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Settings</h3>

        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
          {/* Inference Steps */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-sm">
                Inference Steps <Tooltip text="Number of denoising steps. More steps generally produce higher quality but take longer."><CircleHelp className="inline text-gray-600" size={12} /></Tooltip>
              </label>
              <span className="text-sm text-gray-400">{steps}</span>
            </div>
            <input
              type="range" min={10} max={100} value={steps}
              onChange={(e) => onStepsChange(Number(e.target.value))}
              disabled={disabled}
              className="w-full"
            />
          </div>

          {/* Guidance Scale */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-sm">
                Guidance Scale <Tooltip text="How closely the image follows the prompt. Higher values are more literal, lower values are more creative."><CircleHelp className="inline text-gray-600" size={12} /></Tooltip>
              </label>
              <span className="text-sm text-gray-400">{guidance}</span>
            </div>
            <input
              type="range" min={1} max={20} step={0.5} value={guidance}
              onChange={(e) => onGuidanceChange(Number(e.target.value))}
              disabled={disabled}
              className="w-full"
            />
          </div>

          {/* Seed */}
          <div>
            <label className="text-sm block mb-1">
              Seed (-1 = random) <Tooltip text="Fixed seed for reproducible results. Set to -1 for a random seed each time."><CircleHelp className="inline text-gray-600" size={12} /></Tooltip>
            </label>
            <input
              type="text" inputMode="numeric"
              value={seedInput}
              onChange={(e) => {
                const v = e.target.value
                if (v === '' || v === '-' || /^-?\d+$/.test(v)) onSeedInputChange(v)
              }}
              onBlur={() => {
                const n = parseInt(seedInput, 10)
                if (isNaN(n)) { onSeedChange(-1); onSeedInputChange('-1') }
                else {
                  const clamped = Math.max(-1, Math.min(2147483647, n))
                  onSeedChange(clamped)
                  onSeedInputChange(String(clamped))
                }
              }}
              disabled={disabled}
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm"
            />
          </div>

          {/* Upscaler */}
          <div>
            <label className="text-sm block mb-1">
              Upscaler <Tooltip text="Use Real-ESRGAN to upscale the base image to your target resolution. Set to Disabled to skip upscaling."><CircleHelp className="inline text-gray-600" size={12} /></Tooltip>
            </label>
            <select
              value={enableUpscaling ? upscaleModel : '__disabled__'}
              onChange={(e) => {
                if (e.target.value === '__disabled__') {
                  onEnableUpscalingChange(false)
                } else {
                  onEnableUpscalingChange(true)
                  onUpscaleModelChange(e.target.value)
                }
              }}
              disabled={disabled}
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm"
            >
              <option value="__disabled__">Disabled</option>
              {Object.entries(config.upscaler_models).map(([name, model]) => (
                <option key={name} value={name}>
                  {name} ({model.scale}x) - {model.description}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}
