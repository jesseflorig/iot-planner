import { usePlannerStore } from '../store/plannerStore'
import { getModuleById } from '../data/modules'

export function ActiveModules() {
  const { moduleInstances, removeModule } = usePlannerStore()

  if (moduleInstances.length === 0) {
    return (
      <div className="px-3 py-3 border-b border-zinc-700">
        <div className="text-xs text-zinc-400 mb-2 uppercase tracking-wide">Active Modules</div>
        <p className="text-xs text-zinc-500">No modules added yet.</p>
      </div>
    )
  }

  return (
    <div className="px-3 py-3 border-b border-zinc-700">
      <div className="text-xs text-zinc-400 mb-2 uppercase tracking-wide">Active Modules</div>
      <ul className="space-y-2">
        {moduleInstances.map(inst => {
          const mod = getModuleById(inst.moduleId)
          const name = mod?.name ?? inst.moduleId
          const isError = inst.status === 'error'
          return (
            <li key={inst.instanceId} className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className={`text-xs w-2 h-2 rounded-full shrink-0 ${isError ? 'bg-amber-400' : 'bg-sky-500'}`} />
                  <span className="text-sm text-zinc-200 truncate">{name}</span>
                </div>
                {isError && (
                  <div
                    className="text-xs text-amber-400 mt-0.5 ml-3.5 truncate"
                    title={`Conflicts: ${inst.conflicts.join(', ')}`}
                  >
                    ⚠ {inst.conflicts.length} pin conflict{inst.conflicts.length !== 1 ? 's' : ''}
                  </div>
                )}
              </div>
              <button
                onClick={() => removeModule(inst.instanceId)}
                className="shrink-0 inline-flex h-6 w-6 items-center justify-center rounded border border-zinc-600 text-zinc-400 transition-colors hover:border-red-500 hover:text-red-400"
                aria-label={`Remove ${name}`}
                title={`Remove ${name}`}
              >
                <span aria-hidden="true" className="text-sm leading-none font-medium">×</span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
