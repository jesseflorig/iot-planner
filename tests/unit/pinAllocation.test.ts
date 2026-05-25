import { allocatePins } from '../../src/logic/pinAllocation'
import featherRp2040 from '../../src/data/boards/feather-rp2040'
import poeFeatherwing from '../../src/data/modules/poe-featherwing'
import teletanMosfetPwmDimmer from '../../src/data/modules/teletan-mosfet-pwm-dimmer'

describe('allocatePins', () => {
  it('allocates a functional PWM requirement to another free PWM pin when D10 is claimed', () => {
    const poeAllocation = allocatePins(featherRp2040, poeFeatherwing, [])
    expect(poeAllocation.instance.status).toBe('healthy')

    const dimmerAllocation = allocatePins(
      featherRp2040,
      teletanMosfetPwmDimmer,
      poeAllocation.assignments,
    )

    expect(dimmerAllocation.instance.status).toBe('healthy')
    expect(dimmerAllocation.assignments).toHaveLength(1)
    expect(dimmerAllocation.assignments[0].pinId).not.toBe('left-14')
  })
})
