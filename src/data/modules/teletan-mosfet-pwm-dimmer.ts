import type { Module } from '../../models/module'

const teletanMosfetPwmDimmer: Module = {
  id: 'teletan-mosfet-pwm-dimmer',
  name: 'Teletan MOSFET PWM Dimmer',
  requiredPinLabels: ['PWM'],
  breadboardSpan: 8,
  datasheetUrl: 'https://docs.cirkitdesigner.com/component/2b3ec314-7d5a-4de4-bd3f-5ef7892bf939/mosfet-trigger-switch-pwm-5-30v-15a-30a-max',
}

export default teletanMosfetPwmDimmer
