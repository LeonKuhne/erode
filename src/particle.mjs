import { Pos } from './pos.mjs'

export class Particle extends Pos {

  constructor(pos, features) {
    super(pos.x, pos.y)
    this.forceQueue = new Pos(0, 0)
    this.features = features
    this.vel = new Pos(0, 0)
  }

  feat(key) {
    const feature = this.features[key]
    if (feature instanceof Function) {
      return feature()
    }
    return feature
  }

  attract(other, offset, amount) {
    const delta = other.clone()
    delta.add(offset)
    delta.subtract(this)
    delta.normalize()
    delta.multiply(amount)
    delta.multiply(this.feat('mass')/other.feat('mass'))
    delta.multiply(this.feat('heat')/other.feat('heat'))
    delta.multiply(1 - this.feat("friction"))
    other.forceQueue.subtract(delta)
  }

  force(x, y) {
    this.forceQueue.x += x
    this.forceQueue.y += y
  }

  apply(airFriction, heatSpeed) {
    this._applyForces(airFriction)
    this._applyHeat(heatSpeed)
    this._resetForces()
  }

  _applyForces(airFriction) {
    this.vel.add(this.forceQueue)
    this.vel.multiply(1 - airFriction)
    this.vel.multiply(1 - this.feat("friction"))
    this.add(this.vel)
  }

  _applyHeat(speed) {
    const heatDelta = this.forceQueue.diagonal()
    let nextTemp = this.feat("heat")
    nextTemp += (heatDelta * 2 - 1) * speed
    nextTemp = Math.tanh(nextTemp)
    this.features['heat'] = nextTemp 
  }

  _resetForces() {
    this.forceQueue.x = 0
    this.forceQueue.y = 0
  }

  draw(ctx, zone, particleSize, color=null) {
    if (!color) {
      color = this.feat('color')
      const red = Math.floor((this.feat("heat") + 1) / 2 * 256)
      ctx.fillStyle = `rgb(${red}, ${color[1]}, ${color[2]})`
    } else {
      ctx.fillStyle = color
    }
    const x = zone.x + this.x - particleSize/2 - .5
    const y = zone.y + this.y - particleSize/2 - .5
    ctx.fillRect(x, y, particleSize, particleSize)
  }
}
