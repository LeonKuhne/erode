import { Pos } from "./pos.mjs"
import { Sim } from "./sim.mjs"

window.onload = () => {
  const canvas = document.getElementById("sim")
  const ctx = canvas.getContext("2d")
  const sim = new Sim()
  sim.updateCanvas(canvas)
  sim.addWater(100)
  sim.addLand(100)
  sim.run(ctx)
}