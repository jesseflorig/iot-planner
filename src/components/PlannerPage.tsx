import { BoardSelector } from './BoardSelector'
import { ModuleLibrary } from './ModuleLibrary'
import { ActiveModules } from './ActiveModules'
import { ImportExportBar } from './ImportExportBar'
import { BreadboardView } from './BreadboardView'

export function PlannerPage() {
  return (
    <div className="flex w-full h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-72 shrink-0 bg-zinc-900 border-r border-zinc-700 flex flex-col overflow-hidden">
        <div className="min-h-0 overflow-y-auto">
          <div className="px-3 pt-4 pb-2 border-b border-zinc-700">
            <h1 className="text-sm font-semibold text-zinc-100 tracking-wide">IoT Planner</h1>
          </div>
          <BoardSelector />
          <ActiveModules />
        </div>
        <div className="mt-auto border-t border-zinc-700">
          <ModuleLibrary />
          <ImportExportBar />
        </div>
      </aside>

      {/* Main canvas */}
      <main className="flex-1 overflow-auto bg-zinc-950">
        <BreadboardView />
      </main>
    </div>
  )
}
