import { useRef, useState } from 'react'
import { usePlannerStore } from '../store/plannerStore'

export function ImportExportBar() {
  const { boardId, moduleInstances, pinAssignments, importPackage } = usePlannerStore()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [importError, setImportError] = useState<string | null>(null)

  function handleExport() {
    const pkg = {
      schemaVersion: '1.0.0',
      boardId,
      modules: moduleInstances,
      pinAssignments,
    }
    const blob = new Blob([JSON.stringify(pkg, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'iot-package.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImportError(null)
    const reader = new FileReader()
    reader.onload = ev => {
      try {
        const json = JSON.parse(ev.target?.result as string)
        const result = importPackage(json)
        if (!result.success) {
          setImportError(result.error ?? 'Import failed.')
        }
      } catch {
        setImportError('Could not parse JSON file.')
      }
      // reset so the same file can be re-imported
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
    reader.readAsText(file)
  }

  return (
    <div className="px-3 py-3">
      <div className="text-xs text-zinc-400 mb-2 uppercase tracking-wide">Package</div>
      <div className="flex gap-2">
        <button
          onClick={handleExport}
          className="flex-1 text-xs px-2 py-1.5 rounded border border-zinc-600 text-zinc-300 hover:border-zinc-400 hover:text-zinc-100 transition-colors"
        >
          Export JSON
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex-1 text-xs px-2 py-1.5 rounded border border-zinc-600 text-zinc-300 hover:border-zinc-400 hover:text-zinc-100 transition-colors"
        >
          Import JSON
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          className="hidden"
          onChange={handleFileChange}
          aria-label="Import JSON package"
        />
      </div>
      {importError && (
        <p className="mt-2 text-xs text-amber-400">{importError}</p>
      )}
    </div>
  )
}
