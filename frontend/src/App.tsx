import { useState, useCallback, useEffect } from 'react'
import { useGenerate } from './hooks/useGenerate'
import { deleteImage } from './api/client'
import type { GalleryItem } from './types'
import type { SidebarConfig } from './components/Sidebar'
import Sidebar from './components/Sidebar'
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
  const [settings, setSettings] = useState({
    target_width: 3840,
    target_height: 2160,
    num_inference_steps: 30,
    guidance_scale: 7.5,
    seed: -1,
    enable_upscaling: true,
    upscale_model: 'RealESRGAN_x4plus',
    negative_prompt: '',
  })

  // Gallery refresh key - increment to trigger gallery refresh
  const [galleryRefreshKey, setGalleryRefreshKey] = useState(0)

  // External config to push into sidebar (from gallery load)
  const [externalConfig, setExternalConfig] = useState<SidebarConfig | null>(null)

  const handleLoadConfig = useCallback((item: GalleryItem) => {
    // Set prompt fields
    setPrompt(item.prompt || '')
    setNegativePrompt(item.negative_prompt || '')
    // Push config into sidebar
    setExternalConfig({
      target_width: item.target_resolution?.[0] ?? 3840,
      target_height: item.target_resolution?.[1] ?? 2160,
      num_inference_steps: item.num_inference_steps ?? 30,
      guidance_scale: item.guidance_scale ?? 7.5,
      seed: item.seed ?? -1,
      enable_upscaling: item.enable_upscaling ?? true,
      upscale_model: item.upscale_model || 'RealESRGAN_x4plus',
      negative_prompt: item.negative_prompt || '',
    })
    // Scroll to top so user sees the loaded config
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  // Handle settings changes from sidebar
  const handleSettingsChange = useCallback((newSettings: typeof settings) => {
    setSettings(newSettings)
    // Sync negative prompt from sidebar to form state
    setNegativePrompt(newSettings.negative_prompt)
  }, [])

  // Handle generation request
  const handleGenerate = useCallback(() => {
    if (!prompt.trim()) return

    const request = {
      prompt: prompt.trim(),
      ...settings,
      negative_prompt: negativePrompt || settings.negative_prompt,
    }

    generate(request)
  }, [prompt, negativePrompt, settings, generate])

  // Trigger gallery refresh on completion
  useEffect(() => {
    if (status === 'complete' && result?.success) {
      setTimeout(() => setGalleryRefreshKey(prev => prev + 1), 500)
    }
  }, [status, result])

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <div className="flex flex-col lg:flex-row">
        {/* Sidebar */}
        <aside className="lg:w-80 lg:min-h-screen bg-gray-900 border-r border-gray-800 lg:sticky lg:top-0 lg:max-h-screen lg:overflow-y-auto">
          <div className="p-4 border-b border-gray-800">
            <h1 className="text-xl font-bold text-white">AI Wallpaper Generator</h1>
            <p className="text-xs text-gray-500 mt-1">Powered by SDXL + Real-ESRGAN</p>
          </div>
          <Sidebar onSettingsChange={handleSettingsChange} disabled={isGenerating} externalConfig={externalConfig} />
        </aside>

        {/* Main Content */}
        <main className="flex-1 lg:overflow-y-auto">
          <div className="max-w-5xl mx-auto p-6 lg:p-8">
            {/* Generation Section */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-6">Generate Wallpaper</h2>

              <div className="space-y-6">
                <PromptForm
                  prompt={prompt}
                  negativePrompt={negativePrompt}
                  onPromptChange={setPrompt}
                  onNegativePromptChange={setNegativePrompt}
                  onGenerate={handleGenerate}
                  disabled={isGenerating}
                />

                {/* Progress Bar */}
                {isGenerating && progress && (
                  <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                    <ProgressBar progress={progress} />
                  </div>
                )}

                {/* Error Display */}
                {status === 'error' && error && (
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
                )}

                {/* Result Display */}
                {status === 'complete' && result && (
                  <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
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
            </section>

            {/* Gallery Section */}
            <section>
              <h2 className="text-2xl font-bold mb-6">Gallery</h2>
              <Gallery refreshKey={galleryRefreshKey} onLoadConfig={handleLoadConfig} />
            </section>
          </div>
        </main>
      </div>
    </div>
  )
}

export default App
