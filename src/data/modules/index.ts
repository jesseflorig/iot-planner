import bh1750 from './bh1750'
import dht22 from './dht22'
import maxM10s00b01 from './max-m10s-00b-01'
import poeFeatherwing from './poe-featherwing'
import teletan3v3Relay from './teletan-3v3-relay'
import teletanMosfetPwmDimmer from './teletan-mosfet-pwm-dimmer'
import type { Module } from '../../models/module'

export const MODULES: Module[] = [
  bh1750,
  dht22,
  maxM10s00b01,
  poeFeatherwing,
  teletan3v3Relay,
  teletanMosfetPwmDimmer,
]

export function getModuleById(id: string): Module | undefined {
  return MODULES.find(m => m.id === id)
}
