import type { Module } from '../../models/module'

const poeFeatherwing: Module = {
  id: 'silicognition-poe-featherwing',
  name: 'PoE-FeatherWing',
  manufacturer: 'Silicognition',
  type: 'hat',
  requiredPinLabels: ['SCK', 'MO', 'MI', 'D10', 'SDA', 'SCL'],
  breadboardSpan: 16,
  datasheetUrl: 'https://www.crowdsupply.com/silicognition/poe-featherwing',
}

export default poeFeatherwing
