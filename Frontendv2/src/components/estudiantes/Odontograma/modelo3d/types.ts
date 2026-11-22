export type Arch = 'upper' | 'lower'
export type FDI = string
export type Side = 'right' | 'left'
export type ToothClass = 'incisor' | 'canine' | 'premolar' | 'molar'

export interface ToothInfo {
  fdi: FDI
  arch: Arch
  side: Side
  quadrant: 1 | 2 | 3 | 4
  position: number
  toothClass: ToothClass
  name: string
  shortName: string
}
