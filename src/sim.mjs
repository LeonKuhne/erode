import { Stage } from "./stage.mjs"
import { Pos } from "./pos.mjs"
import { Controls } from "./controls.mjs"

export class Sim {

  constructor(canvas) {
    this.canvas = canvas
    this.ctx = canvas.getContext("2d")
    this.stage = new Stage(50, 10) // grid size, particle size 
    this.stage.updateCanvas(canvas)
    this.gravity = .1        // pixels pull down per tick 
    this.jitter = .5         // max pixels to move per tick
    this.repelAmount = .01   // ratio of distance to move
    this.running = false
    this.tickDelay = 50 // ms per tick
    // create bindings
    this.controls = new Controls()
    this.controls.bind("gravity", () => this.gravity, (x) => this.gravity = x, 0, 10)
    this.controls.bind("jitter", () => this.jitter, (x) => this.jitter = x, 0, 10)
    this.controls.bind("repel amount", () => this.repelAmount, (x) => this.repelAmount= x, 0, 10)
    this.controls.bind("tick delay", () => this.tickDelay, (x) => this.tickDelay = x, 0, 100)
    this.controls.bind("grid size", () => this.stage.minDist, (x) => this.stage.updateGrid(x), 0, 100, false)
  }

  edit(elem) {
    this.controls.renderTo(elem)
  }

  // @param pos normalized Pos between 0 and 1
  highlight(pos, color, neighborsToo=false, count=null) {
    pos.x /= this.stage.width
    pos.y /= this.stage.height
    const particles = this.stage.findParticles(pos) 
    if (count) {
      particles.splice(count)
    }
    this.highlightParticles(particles, color, neighborsToo)
    return particles
  }

  highlightParticles(particles, color, neighborsToo=false) {
    this.stage.highlighted[color] = []
    for (let particle of particles) {
      this.stage.highlighted[color].push({
        particle, color, withNeighbors: neighborsToo
      })
    }
  }

  addWater(pos=new Pos(Math.random(), Math.random()/2)) {
    this.stage.addParticle(pos, {name: "water", mass: 1})
  }

  addLand(pos=new Pos(Math.random(), (Math.random()+1)/2)) {
    this.stage.addParticle(pos, {name: "land", mass: 2})
  }

  run() {
    this.running = true
    const loop = () => {
      if (this.running) {
        this.cycle()
        this.stage.draw(this.ctx)
        setTimeout(loop, this.tickDelay)
      }
    }
    loop()
  }

  cycle() {
    this.stage.update((particle, nearbyParticles) => {
      // jitter
      const jit = () => (Math.random() * 2 - 1) * this.jitter 
      particle.add(new Pos(jit(), jit()))
      // gravity
      particle.force(0, this.gravity)
      // repel nearby
      for (let {particle: other, offset, distance} of nearbyParticles) {
        offset.multiply(this.stage.minDist)
        const amount = (1 - distance/this.stage.minDist) ** 2 
        particle.repel(other, offset, amount * this.repelAmount)
      }
      // adjust heat/spin
      // TODO
    })
  }
}
