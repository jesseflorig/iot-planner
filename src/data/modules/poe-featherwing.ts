import type { Module } from '../../models/module'

const poeFeatherwing: Module = {
  id: 'silicognition-poe-featherwing',
  name: 'Silicognition PoE-FeatherWing',
  requiredPinLabels: ['SCK', 'MO', 'MI', 'D10', 'SDA', 'SCL'],
  breadboardSpan: 16,
  datasheetUrl: 'https://www.crowdsupply.com/silicognition/poe-featherwing',
}

export default poeFeatherwing
