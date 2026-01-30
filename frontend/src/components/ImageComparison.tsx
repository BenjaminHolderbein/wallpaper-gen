interface ImageComparisonProps {
  baseResolution: number[]
  targetResolution: number[]
}

export default function ImageComparison({ baseResolution, targetResolution }: ImageComparisonProps) {
  return (
    <div className="bg-gray-900 rounded-lg p-4">
      <h3 className="text-sm font-medium mb-2 text-gray-300">Resolution Comparison</h3>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-gray-500">Base</span>
          <p className="text-gray-300">{baseResolution[0]}x{baseResolution[1]}</p>
        </div>
        <div>
          <span className="text-gray-500">Final</span>
          <p className="text-gray-300">{targetResolution[0]}x{targetResolution[1]}</p>
        </div>
      </div>
      <p className="text-xs text-gray-500 mt-2">
        Upscaled {(targetResolution[0] / baseResolution[0]).toFixed(1)}x from base resolution
      </p>
    </div>
  )
}
