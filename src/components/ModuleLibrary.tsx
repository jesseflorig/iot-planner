import { usePlannerStore } from '../store/plannerStore'
import { MODULES } from '../data/modules'

export function ModuleLibrary() {
  const { moduleInstances, addModule } = usePlannerStore()
  const activeIds = new Set(moduleInstances.map(m => m.moduleId))

  return (
    <div className="px-3 py-3 border-b border-zinc-700">
      <div className="text-xs text-zinc-400 mb-2 uppercase tracking-wide">Module Library</div>
      <ul className="space-y-1.5">
        {MODULES.map(mod => {
          const active = activeIds.has(mod.id)
          return (
            <li key={mod.id} className="flex items-center justify-between gap-2">
              <span className="text-sm text-zinc-200 truncate">{mod.name}</span>
              <button
                onClick={() => addModule(mod.id)}
                disabled={active}
                className={`shrink-0 text-xs px-2 py-0.5 rounded border transition-colors ${
                  active
                    ? 'border-zinc-600 text-zinc-500 cursor-not-allowed'
                    : 'border-sky-600 text-sky-400 hover:bg-sky-600 hover:text-white'
                }`}
                aria-label={`Add ${mod.name}`}
              >
                {active ? 'Added' : 'Add'}
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
