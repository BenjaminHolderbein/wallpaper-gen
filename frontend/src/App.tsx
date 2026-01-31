import { useState, useCallback, useEffect } from 'react'
import { useGenerate } from './hooks/useGenerate'
import { deleteImage, fetchPresets, fetchBaseResolution } from './api/client'
import type { GalleryItem, PresetsConfig, DevicePreset } from './types'
import Settings from './components/Settings'
import PromptForm from './components/PromptForm'
import ProgressBar from './components/ProgressBar'
import ResultDisplay from './components/ResultDisplay'
import Gallery from './components/Gallery'

function App() {
  // Generation state
  const { status, progress, result, error, generate, reset, isGenerating } = useGenerate()

  // Form state
  const [prompt, setPrompt] = useState('')
  const [negativePrompt, setNegativePrompt] = useState('')

  // Settings state (lifted from Sidebar)
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
  const [baseRes, setBaseRes] = useState<{ base_width: number; base_height: number } | null>(null)

  // Gallery refresh key
  const [galleryRefreshKey, setGalleryRefreshKey] = useState(0)

  // Derived resolution
  const targetWidth = mode === 'preset' ? (selectedPreset?.width ?? 3840) : customWidth
  const targetHeight = mode === 'preset' ? (selectedPreset?.height ?? 2160) : customHeight

  // Fetch presets on mount
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
      const desktopPresets = cfg.presets['Laptop/Desktop'] || []
      const fourK = desktopPresets.find(p => p.name === '4K (UHD)') || desktopPresets[0]
      if (fourK) setSelectedPreset(fourK)
    })
  }, [])

  // Fetch base resolution when target changes
  useEffect(() => {
    fetchBaseResolution(targetWidth, targetHeight).then(setBaseRes).catch(() => {})
  }, [targetWidth, targetHeight])

  const handleLoadConfig = useCallback((item: GalleryItem) => {
    setPrompt(item.prompt || '')
    setNegativePrompt(item.negative_prompt || '')
    setMode('custom')
    setCustomWidth(item.target_resolution?.[0] ?? 3840)
    setCustomHeight(item.target_resolution?.[1] ?? 2160)
    setSteps(item.num_inference_steps ?? 30)
    setGuidance(item.guidance_scale ?? 7.5)
    setSeed(item.seed ?? -1)
    setSeedInput(String(item.seed ?? -1))
    setEnableUpscaling(item.enable_upscaling ?? true)
    setUpscaleModel(item.upscale_model || 'RealESRGAN_x4plus')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  // Handle generation request
  const handleGenerate = useCallback(() => {
    if (!prompt.trim()) return

    generate({
      prompt: prompt.trim(),
      negative_prompt: negativePrompt,
      target_width: targetWidth,
      target_height: targetHeight,
      num_inference_steps: steps,
      guidance_scale: guidance,
      seed,
      enable_upscaling: enableUpscaling,
      upscale_model: upscaleModel,
    })
  }, [prompt, negativePrompt, targetWidth, targetHeight, steps, guidance, seed, enableUpscaling, upscaleModel, generate])

  // Trigger gallery refresh on completion
  useEffect(() => {
    if (status === 'complete' && result?.success) {
      setTimeout(() => setGalleryRefreshKey(prev => prev + 1), 500)
    }
  }, [status, result])

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <div className="px-8 py-6">
        {/* Header */}
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-white">AI Wallpaper Generator</h1>
        </header>

        {/* Two-panel layout: fixed config, flexible results */}
        <div className="flex gap-6 mb-12">
          {/* Left panel — Config (fixed width) */}
          <div className="w-[540px] shrink-0 space-y-6">
            <PromptForm
              prompt={prompt}
              negativePrompt={negativePrompt}
              onPromptChange={setPrompt}
              onNegativePromptChange={setNegativePrompt}
              onGenerate={handleGenerate}
              disabled={isGenerating}
            />

            <Settings
              config={config}
              disabled={isGenerating}
              mode={mode}
              onModeChange={setMode}
              selectedPreset={selectedPreset}
              onPresetChange={setSelectedPreset}
              customWidth={customWidth}
              onCustomWidthChange={setCustomWidth}
              customHeight={customHeight}
              onCustomHeightChange={setCustomHeight}
              steps={steps}
              onStepsChange={setSteps}
              guidance={guidance}
              onGuidanceChange={setGuidance}
              seed={seed}
              onSeedChange={setSeed}
              seedInput={seedInput}
              onSeedInputChange={setSeedInput}
              enableUpscaling={enableUpscaling}
              onEnableUpscalingChange={setEnableUpscaling}
              upscaleModel={upscaleModel}
              onUpscaleModelChange={setUpscaleModel}
              targetWidth={targetWidth}
              targetHeight={targetHeight}
              baseRes={baseRes}
            />
          </div>

          {/* Right panel — Results (fills remaining space) */}
          <div className="flex-1 min-w-0">
            <label className="text-sm font-medium block mb-1">Results</label>
            <div className="sticky top-6 bg-gray-900 border border-gray-800 rounded-lg p-6 min-h-[calc(100%-1.75rem)] flex flex-col">
              {/* Idle placeholder */}
              {status === 'idle' && (
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 text-sm">Generate a wallpaper to see results here</p>
                </div>
              )}

              {/* Progress Bar */}
              {isGenerating && progress && (
                <div className="flex-1 flex flex-col justify-center">
                  <ProgressBar progress={progress} />
                </div>
              )}

              {/* Error Display */}
              {status === 'error' && error && (
                <div className="flex-1">
                  <div className="bg-red-900/30 border border-red-800 rounded-lg p-4">
                    <p className="text-red-400 text-sm font-medium">Error</p>
                    <p className="text-red-300 text-sm mt-1">{error}</p>
                    <button
                      onClick={reset}
                      className="mt-3 text-xs text-red-400 hover:text-red-300 underline"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              )}

              {/* Result Display */}
              {status === 'complete' && result && (
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Result</h3>
                    <button
                      onClick={reset}
                      className="text-xs text-gray-400 hover:text-gray-300"
                    >
                      Clear
                    </button>
                  </div>
                  <ResultDisplay result={result} onDelete={result.filename ? () => {
                    deleteImage(result.filename!).then(() => {
                      reset()
                      setGalleryRefreshKey(prev => prev + 1)
                    })
                  } : undefined} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Gallery — full width */}
        <hr className="border-gray-800 mb-8" />
        <section>
          <h2 className="text-xl font-bold mb-4">Gallery</h2>
          <Gallery refreshKey={galleryRefreshKey} onLoadConfig={handleLoadConfig} />
        </section>
      </div>
    </div>
  )
}

export default App
