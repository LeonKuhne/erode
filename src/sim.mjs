import { Stage } from "./stage.mjs"
import { Pos } from "./pos.mjs"

export class Sim {

  constructor() {
    this.stage = new Stage() 
    this.running = false
    this.addedWater = 0
    this.addedLand = 0
    this.erosionTicks = 1
  }

  updateCanvas(canvas) {
    this.stage.updateSize(canvas.width, canvas.height)  
    canvas.width = this.stage.width
    canvas.height = this.stage.height
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
    // add land to the bottom of the stage
    for (let x=0;x<this.addedLand;x++) {
      const pos = new Pos(Math.random(), 1)
      this.stage.addParticle(pos, { name: "land" })
    }
    // add water to the top of the stage
    for (let x=0;x<this.addedWater;x++) {
      const pos = new Pos(Math.random(), 0)
      this.stage.addParticle(pos, { name: "water" })
    }
    // erode the stage
    for (let x=0;x<this.erosionTicks;x++) {
      this.stage.erode()
    }
  }
}
