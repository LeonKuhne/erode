import { Stage } from "./stage.mjs"
import { Pos } from "./pos.mjs"
import { Controls } from "./controls.mjs"

export class Sim {

  constructor(canvas) {
    this.canvas = canvas
    this.ctx = canvas.getContext("2d")
    this.stage = new Stage(50, 10) // grid size, particle size 
    this.stage.updateCanvas(canvas)
    this.gravity = .2685      // pixels pull down per tick 
    this.jitter = .0166       // max pixels to move per tick
    this.repelAmount = 1.5022 // ratio of distance to move
    this.attractAmount = .4422 // ratio of distance to move
    this.tickDelay = 0        // ms per tick
    this.particlesPerTick = 3 
    this.brightness = 0
    this.stage.setBrightness(this.brightness)
    this.waterMass = 4.9502
    this.landMass = 4.1217
    this.waterFriction = 0.1
    this.landFriction = 0.9
    this.running = false
    this.width = canvas.width
    this.height = canvas.height
    // create bindings
    this.controls = new Controls()
    this.controls.bind("gravity", () => this.gravity, (x) => this.gravity = x, 0, 10)
    this.controls.bind("jitter", () => this.jitter, (x) => this.jitter = x, 0, 10)
    this.controls.bind("repel amount", () => this.repelAmount, (x) => this.repelAmount = x, 0, 10)
    this.controls.bind("attract amount", () => this.attractAmount, (x) => this.attractAmount = x, 0, 10)
    this.controls.bind("tick delay", () => this.tickDelay, (x) => this.tickDelay = x, 0, 100)
    this.controls.bind("particle size", () => this.stage.particleSize, (x) => this.stage.particleSize = x, 0, 100)
    this.controls.bind("grid size", () => this.stage.minDist, (x) => {
      this.stage.updateCanvas(this.canvas, this.width, this.height, x)
    }, 0, 100, false)
    this.controls.bind("grid brightness", () => this.brightness, (x) => {
      x = Number.parseInt(x)
      this.brigthness = x
      this.stage.setBrightness(x)
    }, 0, 255, false)
    this.controls.bind("brush size", () => this.particlesPerTick, (x) => this.particlesPerTick = Number.parseInt(x), 1, 10, false)
    this.controls.bind("water mass", () => this.waterMass, (x) => this.waterMass = x, 0, 10)
    this.controls.bind("land mass", () => this.landMass, (x) => this.landMass = x, 0, 100)
    this.controls.bind("water friction", () => this.waterFriction, (x) => this.waterFriction = x, 0, 3)
    this.controls.bind("land friction", () => this.landFriction, (x) => this.landFriction = x, 0, 3)
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
    for (let x=0;x<this.particlesPerTick;x++) {
      this.stage.addParticle(pos, {
        name: "water", 
        mass: () => this.waterMass, 
        friction: () => this.waterFriction,
        color: "#0000ff",
      })
    }
  }

  addLand(pos=new Pos(Math.random(), (Math.random()+1)/2)) {
    for (let x=0;x<this.particlesPerTick;x++) {
      this.stage.addParticle(pos, {
        name: "land",
        mass: () => this.landMass,
        friction: () => this.landFriction,
        color: "#8b4513",
      })
    }
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
      for (let {particle: other, offset, distance} of nearbyParticles) {
        offset.multiply(this.stage.minDist)
        const amount = (1 - distance/this.stage.minDist) ** 2 
        // repel other particles
        particle.attract(other, offset, -1 * amount * this.repelAmount)
        // attract similar
        if (particle.feat('name') == other.feat('name')) {
          particle.attract(other, offset, amount * this.attractAmount)
        }
      }
      // adjust heat/spin
      // TODO
    })
  }
}
