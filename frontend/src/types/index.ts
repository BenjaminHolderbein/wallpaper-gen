export interface DevicePreset {
  name: string
  width: number
  height: number
}

export interface UpscalerModel {
  scale: number
  description: string
}

export interface PresetsConfig {
  presets: Record<string, DevicePreset[]>
  upscaler_models: Record<string, UpscalerModel>
  default_settings: {
    num_inference_steps: number
    guidance_scale: number
    negative_prompt: string
    enable_upscaling: boolean
    upscale_model: string
    seed: number
  }
}

export interface GenerationSettings {
  prompt: string
  negative_prompt: string
  target_width: number
  target_height: number
  num_inference_steps: number
  guidance_scale: number
  seed: number
  enable_upscaling: boolean
  upscale_model: string
}

export interface GenerateProgress {
  type: 'progress'
  stage: string
  progress: number
  message: string
}

export interface GenerateResult {
  type: 'complete'
  success: boolean
  image_url: string | null
  filename: string | null
  seed_used: number | null
  base_resolution: number[] | null
  target_resolution: number[] | null
  error: string | null
}

export interface GalleryItem {
  filename: string
  image_url: string
  prompt: string | null
  negative_prompt: string | null
  seed: number | null
  num_inference_steps: number | null
  guidance_scale: number | null
  base_resolution: number[] | null
  target_resolution: number[] | null
  enable_upscaling: boolean | null
  upscale_model: string | null
  timestamp: string | null
}

export interface GalleryResponse {
  items: GalleryItem[]
  total: number
  page: number
  per_page: number
  total_pages: number
}
