import { Pos } from './pos.mjs'

export class Particle extends Pos {

  constructor(pos, features) {
    super(pos.x, pos.y)
    this.features = features
    this.forceQueue = new Pos(0, 0)
  }

  repel(other, offset, amount=.1) {
    const deltaX = (other.x - this.x - offset.x) * amount
    const deltaY = (other.y - this.y - offset.y) * amount
    this.forceQueue.x += deltaX
    this.forceQueue.y += deltaY
    other.forceQueue.x -= deltaX
    other.forceQueue.y -= deltaY
  }

  applyForces() {
    this.x += this.forceQueue.x
    this.y += this.forceQueue.y
    this.forceQueue.x = 0
    this.forceQueue.y = 0
  }

  distance(other, offset) {
    return (
      (this.x - other.x - offset.x) ** 2 +  
      (this.y - other.y - offset.y) ** 2
    ) ** .5
  }

  color() {
    // TODO use 'rgb(r,g,b)' for dynamic
    if (this.features['name'] == "water") {
      return '#0000ff' // blue
    } else {
      return '#aa6633' // brown
    }
  }
}
