import poeFeatherwing from './poe-featherwing'
import type { Module } from '../../models/module'

export const MODULES: Module[] = [poeFeatherwing]

export function getModuleById(id: string): Module | undefined {
  return MODULES.find(m => m.id === id)
}
