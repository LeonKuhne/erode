import { Stage } from "./stage.mjs"
import { Pos } from "./pos.mjs"
import { Controls } from "./controls.mjs"

export class Sim {

  constructor() {
    this.stage = new Stage(50, 10) // grid size, particle size 
    this.gravity = .1        // pixels pull down per tick 
    this.jitter = .5         // max pixels to move per tick
    this.repelAmount = .01   // ratio of distance to move
    this.running = false
    // create bindings
    this.controls = new Controls()
    this.controls.bind("gravity", () => this.gravity, (x) => this.gravity = x, 0, 10)
    this.controls.bind("jitter", () => this.jitter, (x) => this.jitter = x, 0, 10)
    this.controls.bind("repel amount", () => this.repelAmount, (x) => this.repelAmount= x, 0, 10)
  }

  edit(elem) {
    this.controls.renderTo(elem)
  }

  // @param pos normalized Pos between 0 and 1
  highlight(pos, color) {
    pos.x /= this.stage.width
    pos.y /= this.stage.height
    const particles = this.stage.findParticles(pos) 
    for (let particle of particles) {
      this.stage.highlighted[color] = {particle, color}
    }
  }

  updateCanvas(canvas) {
    this.stage.updateSize(canvas.width, canvas.height)  
    canvas.width = this.stage.width
    canvas.height = this.stage.height
  }

  addWater(count=1) {
    for (let x=0;x<count;x++) {
      const pos = new Pos(Math.random(), Math.random() * .5)
      this.stage.addParticle(pos, {name: "water"})
    }
  }

  addLand(count=1) {
    for (let x=0;x<count;x++) {
      const pos = new Pos(Math.random(), Math.random() * .5 + .5)
      this.stage.addParticle(pos, {name: "land"})
    }
  }

  run(ctx, delay=20) {
    this.running = true
    const loop = () => {
      if (this.running) {
        this.cycle()
        this.stage.draw(ctx)
        setTimeout(loop, delay)
      }
    }
    loop()
  }

  cycle() {
    this.stage.update((particle, nearby) => {
      // jitter
      const jit = () => (Math.random() * 2 - 1) * this.jitter 
      particle.add(new Pos(jit(), jit()))
      // gravity
      particle.force(0, this.gravity)
      // repel nearby
      for (let neighbor of nearby) {
        // check if close enough
        neighbor.offset.multiply(this.stage.minDist)
        for (let other of neighbor.zone.particles) {
          // ignore self
          if (particle === other) continue
          const distance = particle.distance(other, neighbor.offset)
          if (distance <= this.stage.minDist) {
            const amount = (1 - distance/this.stage.minDist) ** 2 
            particle.repel(other, neighbor.offset, amount * this.repelAmount)
          }
        }
      }
      // adjust heat/spin
      // TODO
    })
  }
}
