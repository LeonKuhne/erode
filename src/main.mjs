import { Sim } from "./sim.mjs"

window.onload = () => {
  const canvas = document.getElementById("sim")
  const sim = new Sim()
  sim.drawToCanvas(canvas)
  sim.run(200)
}
