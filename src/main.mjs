import { Sim } from "./sim.mjs"

window.onload = () => {
  const canvas = document.getElementById("sim")
  const ctx = canvas.getContext("2d")
  const sim = new Sim()
  sim.stage.updateSize(canvas.width, canvas.height)  
  sim.run(ctx)
}
