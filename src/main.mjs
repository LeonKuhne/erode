import { Pos } from "./pos.mjs"
import { Sim } from "./sim.mjs"

window.onload = () => {
  const canvas = document.getElementById("sim")
  const ctx = canvas.getContext("2d")
  const sim = new Sim()
  sim.updateCanvas(canvas)
  const pos = new Pos(Math.random(), 0)
  sim.stage.addParticle(pos, {name: "water"})
  sim.run(ctx)
}