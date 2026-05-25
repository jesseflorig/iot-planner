import type { PinLayout } from '../svg/breadboardLayout'
import { getModuleById } from '../data/modules'
import { usePlannerStore } from '../store/plannerStore'

interface Props {
  pin: PinLayout
  svgRef: React.RefObject<SVGSVGElement | null>
}

const STATUS_LABEL: Record<string, string> = {
  available: 'Available',
  error: 'Conflict',
  power: 'Power / GND',
}

export function PinTooltip({ pin, svgRef }: Props) {
  const { moduleInstances } = usePlannerStore()
  const svg = svgRef.current
  if (!svg) return null

  const pt = svg.createSVGPoint()
  pt.x = pin.x
  pt.y = pin.y
  const screen = pt.matrixTransform(svg.getScreenCTM() ?? undefined)

  const top = screen.y - 12
  const left = screen.x + 14

  const moduleNames = pin.moduleInstanceIds.map(instanceId => {
    const instance = moduleInstances.find(mod => mod.instanceId === instanceId)
    return instance ? (getModuleById(instance.moduleId)?.name ?? instance.moduleId) : instanceId
  })

  const fnLabels = pin.functions
    .filter(f => !['GND', 'POWER_3V3', 'POWER_5V', 'POWER_BAT', 'POWER_EN', 'USB_5V', 'AREF', 'RESET'].includes(f))
    .map(f => f.replace('_', ' ').replace('SPI ', 'SPI/').replace('UART ', 'UART/').replace('I2C ', 'I2C/'))
    .join(', ')

  return (
    <div
      className="pointer-events-none fixed z-50 rounded bg-zinc-800 border border-zinc-600 px-2 py-1.5 text-xs shadow-lg"
      style={{ top, left }}
    >
      <div className="font-semibold text-zinc-100">{pin.label}</div>
      {pin.gpio !== null && <div className="text-zinc-400">GPIO {pin.gpio}</div>}
      {fnLabels && <div className="text-zinc-400">{fnLabels}</div>}
      {moduleNames.length > 0 ? (
        moduleNames.map((name, index) => (
          <div key={`${name}-${index}`} className={`mt-1 font-medium ${pin.status === 'error' ? 'text-amber-400' : 'text-sky-400'}`}>
            {name}
          </div>
        ))
      ) : (
        <div className={`mt-1 font-medium ${
          pin.status === 'available' ? 'text-zinc-300' :
          pin.status === 'error'    ? 'text-amber-400' :
          'text-slate-400'
        }`}>
          {STATUS_LABEL[pin.status]}
        </div>
      )}
    </div>
  )
}
