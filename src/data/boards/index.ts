import featherRp2040 from './feather-rp2040'
import rp2040Shim from './rp2040-shim'
import type { Board } from '../../models/board'

export const BOARDS: Board[] = [featherRp2040, rp2040Shim]

export const DEFAULT_BOARD_ID = 'adafruit-feather-rp2040'

export function getBoardById(id: string): Board | undefined {
  return BOARDS.find(b => b.id === id)
}
