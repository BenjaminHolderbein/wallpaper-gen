interface GalleryFiltersProps {
  search: string
  resolution: string
  resolutions: string[]
  total: number
  onSearchChange: (value: string) => void
  onResolutionChange: (value: string) => void
  onExport: () => void
}

export default function GalleryFilters({
  search, resolution, resolutions, total,
  onSearchChange, onResolutionChange, onExport,
}: GalleryFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <input
        type="text"
        placeholder="Search prompts..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm w-[48rem] focus:outline-none focus:border-indigo-500"
      />
      <select
        value={resolution}
        onChange={(e) => onResolutionChange(e.target.value)}
        className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm"
      >
        <option value="">All Resolutions</option>
        {resolutions.map(r => (
          <option key={r} value={r}>{r}</option>
        ))}
      </select>
      <span className="text-sm text-gray-500">{total} images</span>
      {total > 0 && (
        <button
          onClick={onExport}
          className="bg-gray-800 hover:bg-gray-700 text-sm px-3 py-2 rounded-lg transition"
        >
          Export ZIP
        </button>
      )}
    </div>
  )
}
