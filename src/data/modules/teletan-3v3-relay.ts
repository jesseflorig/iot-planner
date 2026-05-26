import type { Module } from '../../models/module'

const teletan3v3Relay: Module = {
  id: 'teletan-3v3-relay',
  name: '3.3V Relay',
  manufacturer: 'Teletan',
  type: 'component',
  requiredPinLabels: ['GPIO'],
  breadboardSpan: 6,
  datasheetUrl: 'https://manuals.plus/asin/B07XGZSYJV.pdf',
}

export default teletan3v3Relay
