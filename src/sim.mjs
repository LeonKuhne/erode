import { Stage } from "./stage.mjs"
import { Pos } from "./pos.mjs"

export class Sim {

  constructor() {
    this.stage = new Stage() 
    this.running = false
  }

  updateCanvas(canvas) {
    this.stage.updateSize(canvas.width, canvas.height)  
    canvas.width = this.stage.width
    canvas.height = this.stage.height
  }

  addWater(count=1) {
    const pos = new Pos(Math.random(), Math.random() * .5)
    this.stage.addParticle(pos, {name: "water"})
  }

  addLand(count=1) {
    const pos = new Pos(Math.random(), Math.random() * .5 + .5)
    this.stage.addParticle(pos, {name: "land"})
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
    // adjust heat/spin and such TODO
    this.stage.erode()
  }
}
