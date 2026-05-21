import { z } from 'zod'

export const pinFunctionSchema = z.enum([
  'GPIO', 'ADC',
  'I2C_SDA', 'I2C_SCL',
  'SPI_SCK', 'SPI_MOSI', 'SPI_MISO', 'SPI_CS',
  'UART_TX', 'UART_RX',
  'PWM',
  'POWER_3V3', 'POWER_5V', 'POWER_BAT', 'POWER_EN',
  'GND', 'RESET', 'AREF', 'USB_5V',
])

export type PinFunction = z.infer<typeof pinFunctionSchema>

export const pinSchema = z.object({
  id: z.string(),
  label: z.string(),
  gpio: z.number().nullable(),
  functions: z.array(pinFunctionSchema).min(1),
  headerSide: z.enum(['left', 'right']),
  position: z.number().int().min(1),
  type: z.enum(['gpio', 'power', 'ground', 'control']),
})

export type Pin = z.infer<typeof pinSchema>
