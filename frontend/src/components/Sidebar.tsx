import { useState, useEffect } from 'react'
import { CircleHelp } from 'lucide-react'
import Tooltip from './Tooltip'
import { fetchPresets, fetchBaseResolution } from '../api/client'
import type { PresetsConfig, DevicePreset } from '../types'

export interface SidebarConfig {
  target_width: number
  target_height: number
  num_inference_steps: number
  guidance_scale: number
  seed: number
  enable_upscaling: boolean
  upscale_model: string
  negative_prompt: string
}

interface SidebarProps {
  onSettingsChange: (settings: SidebarConfig) => void
  disabled?: boolean
  externalConfig?: SidebarConfig | null
}

export default function Sidebar({ onSettingsChange, disabled, externalConfig }: SidebarProps) {
  const [config, setConfig] = useState<PresetsConfig | null>(null)
  const [mode, setMode] = useState<'preset' | 'custom'>('preset')
  const [selectedPreset, setSelectedPreset] = useState<DevicePreset | null>(null)
  const [customWidth, setCustomWidth] = useState(1920)
  const [customHeight, setCustomHeight] = useState(1080)
  const [steps, setSteps] = useState(30)
  const [guidance, setGuidance] = useState(7.5)
  const [seed, setSeed] = useState(-1)
  const [seedInput, setSeedInput] = useState('-1')
  const [enableUpscaling, setEnableUpscaling] = useState(true)
  const [upscaleModel, setUpscaleModel] = useState('RealESRGAN_x4plus')
  const [negativePompt, setNegativePrompt] = useState('')
  const [baseRes, setBaseRes] = useState<{ base_width: number; base_height: number } | null>(null)

  useEffect(() => {
    fetchPresets().then((cfg) => {
      setConfig(cfg)
      setSteps(cfg.default_settings.num_inference_steps)
      setGuidance(cfg.default_settings.guidance_scale)
      setNegativePrompt(cfg.default_settings.negative_prompt)
      setEnableUpscaling(cfg.default_settings.enable_upscaling)
      setUpscaleModel(cfg.default_settings.upscale_model)
      setSeed(cfg.default_settings.seed)
      setSeedInput(String(cfg.default_settings.seed))
      // Default to 4K preset
      const desktopPresets = cfg.presets['Laptop/Desktop'] || []
      const fourK = desktopPresets.find(p => p.name === '4K (UHD)') || desktopPresets[0]
      if (fourK) setSelectedPreset(fourK)
    })
  }, [])

  // Apply external config when it changes (e.g. loading from gallery)
  useEffect(() => {
    if (!externalConfig) return
    setMode('custom')
    setCustomWidth(externalConfig.target_width)
    setCustomHeight(externalConfig.target_height)
    setSteps(externalConfig.num_inference_steps)
    setGuidance(externalConfig.guidance_scale)
    setSeed(externalConfig.seed)
    setSeedInput(String(externalConfig.seed))
    setEnableUpscaling(externalConfig.enable_upscaling)
    setUpscaleModel(externalConfig.upscale_model)
    setNegativePrompt(externalConfig.negative_prompt)
  }, [externalConfig])

  const targetWidth = mode === 'preset' ? (selectedPreset?.width ?? 3840) : customWidth
  const targetHeight = mode === 'preset' ? (selectedPreset?.height ?? 2160) : customHeight

  useEffect(() => {
    fetchBaseResolution(targetWidth, targetHeight).then(setBaseRes).catch(() => {})
  }, [targetWidth, targetHeight])

  useEffect(() => {
    onSettingsChange({
      target_width: targetWidth,
      target_height: targetHeight,
      num_inference_steps: steps,
      guidance_scale: guidance,
      seed,
      enable_upscaling: enableUpscaling,
      upscale_model: upscaleModel,
      negative_prompt: negativePompt,
    })
  }, [targetWidth, targetHeight, steps, guidance, seed, enableUpscaling, upscaleModel, negativePompt, onSettingsChange])

  if (!config) return <div className="p-4 text-gray-400">Loading...</div>

  const allPresets = Object.entries(config.presets)

  return (
    <div className="flex flex-col gap-6 p-4">
      {/* Resolution */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Resolution</h2>
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => setMode('preset')}
            disabled={disabled}
            className={`flex-1 px-3 py-1.5 rounded text-sm font-medium transition ${
              mode === 'preset' ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Preset
          </button>
          <button
            onClick={() => setMode('custom')}
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
                if (found) { setSelectedPreset(found); break }
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
                onChange={(e) => setCustomWidth(Number(e.target.value))}
                disabled={disabled}
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs text-gray-400">Height</label>
              <input
                type="number" min={64} max={8192} step={8}
                value={customHeight}
                onChange={(e) => setCustomHeight(Number(e.target.value))}
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
        <h2 className="text-lg font-semibold mb-3">Settings</h2>

        <div className="flex flex-col gap-4">
          {/* Inference Steps */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-sm">
                Inference Steps <Tooltip text="Number of denoising steps. More steps generally produce higher quality but take longer."><CircleHelp className="inline text-gray-500" size={14} /></Tooltip>
              </label>
              <span className="text-sm text-gray-400">{steps}</span>
            </div>
            <input
              type="range" min={10} max={100} value={steps}
              onChange={(e) => setSteps(Number(e.target.value))}
              disabled={disabled}
              className="w-full"
            />
          </div>

          {/* Guidance Scale */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-sm">
                Guidance Scale <Tooltip text="How closely the image follows the prompt. Higher values are more literal, lower values are more creative."><CircleHelp className="inline text-gray-500" size={14} /></Tooltip>
              </label>
              <span className="text-sm text-gray-400">{guidance}</span>
            </div>
            <input
              type="range" min={1} max={20} step={0.5} value={guidance}
              onChange={(e) => setGuidance(Number(e.target.value))}
              disabled={disabled}
              className="w-full"
            />
          </div>

          {/* Seed */}
          <div>
            <label className="text-sm block mb-1">
              Seed (-1 = random) <Tooltip text="Fixed seed for reproducible results. Set to -1 for a random seed each time."><CircleHelp className="inline text-gray-500" size={14} /></Tooltip>
            </label>
            <input
              type="text" inputMode="numeric"
              value={seedInput}
              onChange={(e) => {
                const v = e.target.value
                if (v === '' || v === '-' || /^-?\d+$/.test(v)) setSeedInput(v)
              }}
              onBlur={() => {
                const n = parseInt(seedInput, 10)
                if (isNaN(n)) { setSeed(-1); setSeedInput('-1') }
                else { setSeed(Math.max(-1, Math.min(2147483647, n))); setSeedInput(String(Math.max(-1, Math.min(2147483647, n)))) }
              }}
              disabled={disabled}
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm"
            />
          </div>

          {/* Upscaling */}
          <div>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox" checked={enableUpscaling}
                onChange={(e) => setEnableUpscaling(e.target.checked)}
                disabled={disabled}
                className="accent-indigo-600"
              />
              Enable AI Upscaling <Tooltip text="Use Real-ESRGAN to upscale the base image to your target resolution."><CircleHelp className="inline text-gray-500" size={14} /></Tooltip>
            </label>
          </div>

          {enableUpscaling && (
            <div>
              <label className="text-sm block mb-1">Upscaler Model</label>
              <select
                value={upscaleModel}
                onChange={(e) => setUpscaleModel(e.target.value)}
                disabled={disabled}
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm"
              >
                {Object.entries(config.upscaler_models).map(([name, model]) => (
                  <option key={name} value={name}>
                    {name} ({model.scale}x) - {model.description}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
