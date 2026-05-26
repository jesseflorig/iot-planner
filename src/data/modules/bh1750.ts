import type { Module } from '../../models/module'

const bh1750: Module = {
  id: 'hiletgo-gy-302-bh1750',
  name: 'HiLetgo GY-302 BH1750 Light Sensor Module',
  type: 'component',
  requiredPinLabels: ['I2C_SDA', 'I2C_SCL'],
  breadboardSpan: 6,
  datasheetUrl: 'https://www.handsontec.com/dataspecs/sensor/BH1750%20Light%20Sensor.pdf',
}

export default bh1750
