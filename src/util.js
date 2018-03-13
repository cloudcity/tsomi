// @flow

type Point = {
  x: number,
  y: number
}

export const convertSpaces = (element: string): string =>
  element.replace('%20', '_').replace(' ', '_')

export const angleRadians = (p1: Point, p2: Point): number =>
  Math.atan2(p2.y - p1.y, p2.x - p1.x)

export const radial = (point: Point, radius: number, radians: number): Point => ({ 
  x: Math.cos(radians) * radius + point.x, 
  y: Math.sin(radians) * radius + point.y
})

