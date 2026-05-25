import { usePlannerStore } from '../store/plannerStore'
import { MODULES } from '../data/modules'

export function ModuleLibrary() {
  const { addModule } = usePlannerStore()

  return (
    <div className="px-3 py-3 border-b border-zinc-700">
      <div className="text-xs text-zinc-400 mb-2 uppercase tracking-wide">Module Library</div>
      <ul className="space-y-1.5">
        {MODULES.map(mod => {
          return (
            <li key={mod.id} className="flex items-center justify-between gap-2">
              <span className="text-sm text-zinc-200 truncate">{mod.name}</span>
              <button
                onClick={() => addModule(mod.id)}
                className="shrink-0 inline-flex h-6 w-6 items-center justify-center rounded border border-sky-600 text-sky-400 transition-colors hover:bg-sky-600 hover:text-white"
                aria-label={`Add ${mod.name}`}
                title={`Add ${mod.name}`}
              >
                <span aria-hidden="true" className="text-sm leading-none font-medium">+</span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
