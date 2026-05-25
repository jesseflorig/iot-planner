import { allocatePins, reEvaluateAll } from '../../src/logic/pinAllocation'
import featherRp2040 from '../../src/data/boards/feather-rp2040'
import poeFeatherwing from '../../src/data/modules/poe-featherwing'
import teletanMosfetPwmDimmer from '../../src/data/modules/teletan-mosfet-pwm-dimmer'
import dht22 from '../../src/data/modules/dht22'
import { getModuleById } from '../../src/data/modules'

describe('allocatePins', () => {
  it('allocates a functional PWM requirement to another free PWM pin when D10 is claimed', () => {
    const poeAllocation = allocatePins(featherRp2040, poeFeatherwing, 'poe-1', [])
    expect(poeAllocation.instance.status).toBe('healthy')
    expect(poeAllocation.assignments.some(assignment => assignment.pinId === 'left-14')).toBe(true)

    const dimmerAllocation = allocatePins(
      featherRp2040,
      teletanMosfetPwmDimmer,
      'dimmer-1',
      poeAllocation.assignments,
    )

    expect(dimmerAllocation.instance.status).toBe('healthy')
    expect(dimmerAllocation.assignments).toHaveLength(1)
    expect(dimmerAllocation.assignments[0].pinId).not.toBe(poeAllocation.assignments[0].pinId)
  })

  it('allows the same module definition to be allocated as separate instances', () => {
    const first = allocatePins(featherRp2040, dht22, 'dht22-1', [])
    const second = allocatePins(featherRp2040, dht22, 'dht22-2', first.assignments)

    expect(first.instance.instanceId).toBe('dht22-1')
    expect(second.instance.instanceId).toBe('dht22-2')
    expect(first.assignments[0].moduleInstanceId).toBe('dht22-1')
    expect(first.instance.status).toBe('healthy')
    expect(second.instance.status).toBe('healthy')
    expect(second.assignments[0].pinId).not.toBe(first.assignments[0].pinId)
  })

  it('recomputes assignments so hat modules take priority over dynamic components', () => {
    const { instances, assignments } = reEvaluateAll(
      featherRp2040,
      [
        { instanceId: 'dimmer-1', moduleId: teletanMosfetPwmDimmer.id },
        { instanceId: 'poe-1', moduleId: poeFeatherwing.id },
      ],
      getModuleById,
    )

    const poeInstance = instances.find(instance => instance.instanceId === 'poe-1')
    const dimmerAssignment = assignments.find(assignment => assignment.moduleInstanceId === 'dimmer-1')

    expect(poeInstance?.status).toBe('healthy')
    expect(assignments.some(assignment => assignment.moduleInstanceId === 'poe-1' && assignment.pinId === 'left-14')).toBe(true)
    expect(dimmerAssignment).toBeDefined()
    expect(dimmerAssignment?.pinId).not.toBe('left-14')
  })
})
