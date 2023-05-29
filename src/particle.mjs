import { Pos } from './pos.mjs'

export class Particle extends Pos {

  constructor(pos, features) {
    super(pos.x, pos.y)
    this.features = features
  }

  react(other) {
    console.log("Particle.react not implemented")
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
