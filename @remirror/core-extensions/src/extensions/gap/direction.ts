export enum Direction {
  UP = 'up',
  RIGHT = 'right',
  DOWN = 'down',
  LEFT = 'left',
  BACKWARD = 'backward',
  FORWARD = 'forward',
}

export function isBackward(dir: Direction): boolean {
  return [Direction.UP, Direction.LEFT, Direction.BACKWARD].indexOf(dir) !== -1;
}

export function isForward(dir: Direction): boolean {
  return [Direction.RIGHT, Direction.DOWN, Direction.FORWARD].indexOf(dir) !== -1;
}
