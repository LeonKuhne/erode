import { Pos } from './pos.mjs'

export class Particle extends Pos {

  constructor(pos, features) {
    super(pos.x, pos.y)
    this.vel = new Pos(0, 0)
    this.acc = new Pos(0, 0)
    this.forceQueue = new Pos(0, 0)
    this.features = features
  }

  repel(other, offset, amount) {
    const delta = new Pos(
      (other.x - this.x - offset.x),
      (other.y - this.y - offset.y)
    )
    delta.multiply(amount)
    other.forceQueue.add(delta)
    delta.multiply(-1)
    this.forceQueue.add(delta)
  }

  applyForces() {
    //this.acc.add(this.forceQueue)
    //this.vel.add(this.acc)
    //this.add(this.vel)
    this.add(this.forceQueue)
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
