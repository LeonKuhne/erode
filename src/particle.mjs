import { Pos } from './pos.mjs'

export class Particle extends Pos {

  constructor(pos, features) {
    super(pos.x, pos.y)
    this.forceQueue = new Pos(0, 0)
    this.features = features
  }

  repel(other, offset, amount) {
    const delta = other.clone()
    delta.add(offset)
    delta.subtract(this)
    delta.multiply(amount)
    other.forceQueue.add(delta)
    this.forceQueue.subtract(delta)
  }

  force(x, y) {
    this.forceQueue.x += x
    this.forceQueue.y += y
  }

  applyForces() {
    this.add(this.forceQueue)
    this.forceQueue.x = 0
    this.forceQueue.y = 0
  }

  color() {
    // TODO use 'rgb(r,g,b)' for dynamic
    if (this.features['name'] == "water") {
      return '#0000ff' // blue
    } else {
      return '#aa6633' // brown
    }
  }

  draw(ctx, zone, particleSize, color=this.color()) { 
    const x = zone.x + this.x - particleSize/2 - .5
    const y = zone.y + this.y - particleSize/2 - .5
    ctx.fillStyle = color
    ctx.fillRect(x, y, particleSize, particleSize)
  }
}
