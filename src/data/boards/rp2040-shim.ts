import type { Board } from '../../models/board'

// NOTE: GPIO numbers are provisional — Feather-compatible pin labels are correct
// but raw GPIO routing differs from standard Feather RP2040.
// Verify from KiCAD files at https://github.com/xorbit/RP2040-Shim before release.
const rp2040Shim: Board = {
  id: 'silicognition-rp2040-shim',
  name: 'RP2040 Shim',
  manufacturer: 'Silicognition',
  headerLength: 16,
  breadboardSpan: 12,
  datasheetUrl: 'https://www.silicognition.com/products/rp2040-shim',
  pins: [
    // Left header — Feather-compatible labels, compact form factor
    { id: 'left-1',  label: 'GND',  gpio: null, functions: ['GND'],                                          headerSide: 'left', position: 1,  type: 'ground'  },
    { id: 'left-2',  label: '3V3',  gpio: null, functions: ['POWER_3V3'],                                    headerSide: 'left', position: 2,  type: 'power'   },
    { id: 'left-3',  label: 'AREF', gpio: null, functions: ['AREF'],                                         headerSide: 'left', position: 3,  type: 'control' },
    { id: 'left-4',  label: 'A0',   gpio: 26,   functions: ['GPIO', 'ADC', 'SPI_SCK', 'I2C_SDA', 'PWM'],    headerSide: 'left', position: 4,  type: 'gpio'    },
    { id: 'left-5',  label: 'A1',   gpio: 27,   functions: ['GPIO', 'ADC', 'SPI_MOSI', 'I2C_SCL', 'PWM'],   headerSide: 'left', position: 5,  type: 'gpio'    },
    { id: 'left-6',  label: 'A2',   gpio: 28,   functions: ['GPIO', 'ADC', 'SPI_MISO', 'PWM'],               headerSide: 'left', position: 6,  type: 'gpio'    },
    { id: 'left-7',  label: 'A3',   gpio: 29,   functions: ['GPIO', 'ADC', 'SPI_CS', 'PWM'],                 headerSide: 'left', position: 7,  type: 'gpio'    },
    { id: 'left-8',  label: 'D24',  gpio: 24,   functions: ['GPIO', 'UART_TX', 'I2C_SDA', 'PWM'],            headerSide: 'left', position: 8,  type: 'gpio'    },
    { id: 'left-9',  label: 'D25',  gpio: 25,   functions: ['GPIO', 'UART_RX', 'I2C_SCL', 'PWM'],            headerSide: 'left', position: 9,  type: 'gpio'    },
    { id: 'left-10', label: 'D4',   gpio: 6,    functions: ['GPIO', 'SPI_SCK', 'I2C_SDA', 'PWM'],            headerSide: 'left', position: 10, type: 'gpio'    },
    { id: 'left-11', label: 'D13',  gpio: 13,   functions: ['GPIO', 'SPI_CS', 'UART_RX', 'I2C_SCL', 'PWM'], headerSide: 'left', position: 11, type: 'gpio'    },
    { id: 'left-12', label: 'D12',  gpio: 12,   functions: ['GPIO', 'SPI_MISO', 'UART_TX', 'I2C_SDA', 'PWM'],headerSide: 'left', position: 12, type: 'gpio'    },
    { id: 'left-13', label: 'D11',  gpio: 11,   functions: ['GPIO', 'SPI_MOSI', 'I2C_SCL', 'PWM'],           headerSide: 'left', position: 13, type: 'gpio'    },
    { id: 'left-14', label: 'D10',  gpio: 10,   functions: ['GPIO', 'SPI_SCK', 'I2C_SDA', 'PWM'],            headerSide: 'left', position: 14, type: 'gpio'    },
    { id: 'left-15', label: 'D9',   gpio: 9,    functions: ['GPIO', 'SPI_CS', 'UART_RX', 'I2C_SCL', 'PWM'], headerSide: 'left', position: 15, type: 'gpio'    },
    { id: 'left-16', label: 'GND',  gpio: null, functions: ['GND'],                                          headerSide: 'left', position: 16, type: 'ground'  },

    // Right header
    { id: 'right-1',  label: 'BAT',  gpio: null, functions: ['POWER_BAT'],                                    headerSide: 'right', position: 1,  type: 'power'   },
    { id: 'right-2',  label: 'EN',   gpio: null, functions: ['POWER_EN'],                                     headerSide: 'right', position: 2,  type: 'power'   },
    { id: 'right-3',  label: 'USB',  gpio: null, functions: ['USB_5V'],                                       headerSide: 'right', position: 3,  type: 'power'   },
    { id: 'right-4',  label: 'D6',   gpio: 8,    functions: ['GPIO', 'SPI_MISO', 'UART_TX', 'I2C_SDA', 'PWM'],headerSide: 'right', position: 4,  type: 'gpio'    },
    { id: 'right-5',  label: 'D5',   gpio: 7,    functions: ['GPIO', 'SPI_MOSI', 'I2C_SCL', 'PWM'],           headerSide: 'right', position: 5,  type: 'gpio'    },
    { id: 'right-6',  label: 'SCL',  gpio: 3,    functions: ['GPIO', 'I2C_SCL', 'SPI_MOSI', 'PWM'],           headerSide: 'right', position: 6,  type: 'gpio'    },
    { id: 'right-7',  label: 'SDA',  gpio: 2,    functions: ['GPIO', 'I2C_SDA', 'SPI_SCK', 'PWM'],            headerSide: 'right', position: 7,  type: 'gpio'    },
    { id: 'right-8',  label: 'RX',   gpio: 1,    functions: ['GPIO', 'UART_RX', 'I2C_SDA', 'SPI_CS', 'PWM'], headerSide: 'right', position: 8,  type: 'gpio'    },
    { id: 'right-9',  label: 'TX',   gpio: 0,    functions: ['GPIO', 'UART_TX', 'I2C_SCL', 'SPI_MISO', 'PWM'],headerSide: 'right', position: 9,  type: 'gpio'    },
    { id: 'right-10', label: 'MI',   gpio: 20,   functions: ['GPIO', 'SPI_MISO', 'UART_TX', 'I2C_SDA', 'PWM'],headerSide: 'right', position: 10, type: 'gpio'    },
    { id: 'right-11', label: 'MO',   gpio: 19,   functions: ['GPIO', 'SPI_MOSI', 'I2C_SCL', 'PWM'],           headerSide: 'right', position: 11, type: 'gpio'    },
    { id: 'right-12', label: 'SCK',  gpio: 18,   functions: ['GPIO', 'SPI_SCK', 'I2C_SDA', 'PWM'],            headerSide: 'right', position: 12, type: 'gpio'    },
    { id: 'right-13', label: 'D7',   gpio: null, functions: ['GPIO'],                                          headerSide: 'right', position: 13, type: 'gpio'    },
    { id: 'right-14', label: 'D8',   gpio: null, functions: ['GPIO'],                                          headerSide: 'right', position: 14, type: 'gpio'    },
    { id: 'right-15', label: 'RST',  gpio: null, functions: ['RESET'],                                         headerSide: 'right', position: 15, type: 'control' },
    { id: 'right-16', label: 'GND',  gpio: null, functions: ['GND'],                                           headerSide: 'right', position: 16, type: 'ground'  },
  ],
}

export default rp2040Shim
