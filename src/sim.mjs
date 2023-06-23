import { Stage } from "./stage.mjs"
import { Pos } from "./pos.mjs"

export class Sim {

  constructor(canvas, controls) {
    this.canvas = canvas
    this.ctx = canvas.getContext("2d")
    this.stage = new Stage(50, 10) // grid size, particle size 
    this.stage.updateCanvas(canvas)
    this.running = false
    this.width = canvas.width
    this.height = canvas.height
    this.defaultSettings = { min: 0, max: 1, log: true }
    this.settings = {
      "gravity": { val: 0.2685 },
      "jitter": { val: 0.0166, max: 10 },
      "repel amount": { val: 1.5022, max: 5 },
      "attract amount": { val: 0.4422, max: 5 },
      "tick delay": { val: 0, max: 100 },
      "particle size": { val: 3, max: 50, log: false },
      "grid size": { max: 100, log: false, get: () => this.stage.minDist, set: (x) => { 
        this.stage.updateCanvas(this.canvas, this.width, this.height, x)
      } },
      "grid brightness": { val: 0, max: 255, log: false, preset: (x) => {
        x = Number.parseInt(x)
        this.stage.setBrightness(x)
        return x
      } },
      "brush size": { val: 3, preset: (x) => Number.parseInt(x), min: 1, max: 10, log: false },
      "water mass": { val: 1.9502, "max": 10 },
      "land mass": { val: 4.1217, max: 100 },
      "water friction": { val: 0.1, max: 3 },
      "land friction": { val: 0.9, max: 3 },
      "air friction": { "get": () => this.stage.airFriction, "set": (x) => this.stage.airFriction = x, log: false },
      "heat speed": { "get": () => this.stage.heatSpeed, "set": (x) => this.stage.heatSpeed = x, log: false },
    }
    this._bind(controls)
    this.stage.setBrightness(this.settings["grid brightness"].get())
  }

  _bind(controls) {
    // bind settings to values
    for (let name of Object.keys(this.settings)) {
      // merge with default settings
      const setting = { ...this.defaultSettings, ...this.settings[name] }
      // setup values
      if (setting.val !== undefined) {
        setting.get = () => setting.val
        setting.set = (x) => setting.val = x
        if (setting.preset) {
          setting.set = (x) => {
            setting.val = setting.preset(x)
          }
        }
      }
      this.settings[name] = setting
      // bind to controls
      const { get, set, min, max, log } = setting 
      controls.bind(name, get, set, min, max, log)
    }
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
    for (let x=0;x<this.settings["brush size"].get();x++) {
      this.stage.addParticle(pos, {
        name: "water", 
        mass: this.settings["water mass"].get, 
        friction: this.settings["water friction"].get,
        color: [0,0,255],
        heat: 1,
      })
    }
  }

  addLand(pos=new Pos(Math.random(), (Math.random()+1)/2)) {
    for (let x=0;x<this.settings["brush size"].get();x++) {
      this.stage.addParticle(pos, {
        name: "land",
        mass: () => this.settings["land mass"].get(),
        friction: () => this.settings["land friction"].get(),
        color: [0,255,0],
        heat: 1,
      })
    }
  }

  run() {
    this.running = true
    const loop = () => {
      if (this.running) {
        this.cycle()
        this.stage.draw(this.ctx)
        setTimeout(loop, this.settings["tick delay"].get())
      }
    }
    loop()
  }

  cycle() {
    this.stage.update((particle, nearbyParticles) => {
      // jitter
      const jit = () => (Math.random() * 2 - 1) * this.settings["jitter"].get()
      particle.add(new Pos(jit(), jit()))
      // gravity
      particle.force(0, this.settings["gravity"].get()) 
      for (let {particle: other, offset, distance} of nearbyParticles) {
        const gridSize = this.settings["grid size"].get()
        offset.multiply(gridSize)
        const amount = (1 - distance/gridSize) ** 2 
        // repel other particles
        particle.attract(other, offset, -1 * amount * this.settings["repel amount"].get())
        // attract similar
        if (particle.feat('name') == other.feat('name')) {
          particle.attract(other, offset, amount * this.settings["attract amount"].get())
        }
      }
    })
  }
}
