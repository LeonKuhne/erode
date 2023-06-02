import { Sim } from "./sim.mjs"

window.onload = () => {
  const canvas = document.getElementById("sim")
  const ctx = canvas.getContext("2d")
  const sim = new Sim()
  sim.updateCanvas(canvas)
  sim.addWater(500)
  sim.addLand(500)
  sim.run(ctx)
}