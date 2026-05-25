import type { Module } from '../../models/module'

const dht22: Module = {
  id: 'dht22',
  name: 'DHT22',
  type: 'component',
  requiredPinLabels: ['GPIO'],
  breadboardSpan: 6,
  datasheetUrl: 'https://files.seeedstudio.com/wiki/Grove-Temperature-Humidity-Sensor-DHT11/DHT22.pdf',
}

export default dht22
