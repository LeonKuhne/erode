export class Pos {
  constructor(x, y) {
    this.x = x
    this.y = y
  }

  add(other) {
    this.x += other.x
    this.y += other.y
  }

  subtract(other) {
    this.x -= other.x
    this.y -= other.y
  }

  multiply(factor) {
    this.x *= factor
    this.y *= factor
  }

  divide(factor) {
    this.x /= factor
    this.y /= factor
  }

  distance(other, offset) {
    const delta = other.clone()
    delta.add(offset)
    delta.subtract(this)
    return (delta.x ** 2 + delta.y ** 2) ** .5 
  }

  normalize() {
    const magnitude = (this.x ** 2 + this.y ** 2) ** .5
    this.divide(magnitude)
  }

  clone() {
    return new Pos(this.x, this.y)
  }
}