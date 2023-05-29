import { Stage } from "./stage.mjs"
import { Water } from "./elements/water.mjs"
import { Sand } from "./elements/sand.mjs"
import { Dirt } from "./elements/dirt.mjs"

export class Sim {

  constructor() {
    this.stage = new Stage() 
    this.running = false
    this.addedWater = 5
    this.addedLand = 20
    this.dirtRatio = 0.5
    this.erosionTicks = 10
    this.contexts = []
  }

  drawToCanvas(canvas) {
    const ctx = canvas.getContext("2d")
    this.contexts.append(ctx)
  }

  run(delay=10) {
    this.running = true
    const loop = () => {
      if (this.running) {
        this.cycle()
        setTimeout(loop, delay)
      }
    }
    loop()
  }

  cycle() {
    // add land to the bottom of the stage
    for (let x=0;x<this.addedDirt;x++) {
      const land = Math.random() < dirtRatio ? new Dirt() : new Sand()
      this.stage.addElement(land, Math.random(), 0)
    }
    // add water to the top of the stage
    for (let x=0;x<this.addedWater;x++) {
      this.stage.addElement(new Water, Math.random(), 1)
    }
    // erode the stage
    for (let x=0;x<this.erosionTicks;x++) {
      this.stage.erode()
    }
    // draw to all screens
    for (let ctx of this.contexts) {
      this.stage.draw(ctx)
    }
  }
}
