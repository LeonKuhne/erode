import { Pos } from './pos.mjs'
import { Track } from './track.mjs'

export class Particle extends Pos {

  static COUNT = 0

  constructor(zone, pos, features) {
    super(pos.x, pos.y)
    this.forceQueue = new Pos(0, 0)
    this.features = features
    this.vel = new Pos(0, 0)
    this.zone = zone
    this.id = Particle.COUNT
    Particle.COUNT += 1
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
    // mass ratio
    delta.multiply(this.feat('mass') / other.feat('mass'))
    // heat ratio
    if (other.feat('heat')) {
      delta.multiply(this.feat('heat') / other.feat('heat'))
    }
    delta.multiply(1 - this.feat("friction"))
    other.forceQueue.subtract(delta)
    if (Number.isNaN(other.forceQueue.x)) {
      console.log('force is nan')
    }
  }

  force(x, y) {
    this.forceQueue.x += x
    this.forceQueue.y += y
    if (Number.isNaN(this.forceQueue.x)) {
      console.log('force is nan')
    }
  }

  apply(airFriction, heatSpeed) {
    this._applyForces(airFriction)
    this._applyHeat(heatSpeed)
    this._resetForces()
  }

  _applyForces(airFriction) {
    this.vel.add(this.forceQueue)
    this.vel.multiply(1 - airFriction)
    this.vel.multiply(1 - this.feat("friction")) // this should also include heat because glaciers dont move
    this.add(this.vel)
    if (Number.isNaN(this.forceQueue.x)) {
      console.log('force is nan')
    }
  }

  _applyHeat(speed) {
    // x: pressure
    const sigmoid = x => (1/(1+Math.exp(-(x-.5))))
    this.features['heat'] *= sigmoid(speed * this.forceQueue.magnitude())
    if (Number.isNaN(this.forceQueue.x)) {
      console.log('force is nan')
    }
    Track.mark(`${this.id} heat`, this.features['heat'])
  }

  _resetForces() {
    this.forceQueue.x = 0
    this.forceQueue.y = 0
    if (Number.isNaN(this.forceQueue.x)) {
      console.log('force is nan')
    }
  }

  draw(ctx, zone, particleSize, color=null) {
    if (!color) {
      color = this.feat('color')
      if (this.feat('heat') < 0 || this.feat('heat') > 1) {
        console.error("heat is out of range", this.feat('heat'))
      }
      const red = Math.floor((this.feat("heat") + 1) / 2 * 256)
      if (Number.isNaN(red)) {
        throw Error("color heat value is NaN")
      }
      ctx.fillStyle = `rgb(${red}, ${color[1]}, ${color[2]})`
    } else {
      ctx.fillStyle = color
    }
    const size = particleSize * (1 + this.feat('mass') ** .5)
    //Track.mark('particle size', size)
    const x = zone.x + this.x - size/2 - .5
    const y = zone.y + this.y - size/2 - .5
    ctx.fillRect(x, y, size, size)
  }
}
