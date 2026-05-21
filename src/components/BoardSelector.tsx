import { usePlannerStore } from '../store/plannerStore'
import { BOARDS } from '../data/boards'

export function BoardSelector() {
  const { boardId, setBoard } = usePlannerStore()

  return (
    <div className="px-3 py-3 border-b border-zinc-700">
      <label className="block text-xs text-zinc-400 mb-1.5 uppercase tracking-wide">Board</label>
      <select
        value={boardId}
        onChange={e => setBoard(e.target.value)}
        className="w-full bg-zinc-800 border border-zinc-600 text-zinc-100 text-sm rounded px-2 py-1.5 focus:outline-none focus:border-sky-500"
        aria-label="Select board"
      >
        {BOARDS.map(b => (
          <option key={b.id} value={b.id}>{b.name}</option>
        ))}
      </select>
    </div>
  )
}
