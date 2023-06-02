export class Pos {
  constructor(x, y) {
    this.x = x
    this.y = y
  }

  add(other) {
    this.x += other.x
    this.y += other.y
  }

  multiply(factor) {
    this.x *= factor
    this.y *= factor
  }
}