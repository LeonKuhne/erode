import { Stage } from "./stage.mjs"
import { Pos } from "./pos.mjs"

export class Sim {

  constructor() {
    this.stage = new Stage() 
    this.running = false
    this.gravity = 3 // pixels pull down per tick 
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
      // apply gravity
      //particle.y += this.gravity
      // repel nearby
      for (let [neighbor, offset] of nearby) {
        // check if close enough
        offset.x *= this.stage.minDist
        offset.y *= this.stage.minDist
        if (particle.distance(neighbor, offset) < this.stage.minDist) {
          particle.repel(neighbor)
        }
      }
      // adjust heat/spin
      // TODO
    })
  }
}
