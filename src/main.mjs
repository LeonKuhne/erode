import { Sim } from "./sim.mjs"
import { Pos } from "./pos.mjs"

window.onload = () => {
  const canvas = document.getElementById("sim")
  const controls = document.getElementById("controls")
  const ctx = canvas.getContext("2d")
  const sim = new Sim()
  sim.updateCanvas(canvas)
  sim.addWater(500)
  sim.addLand(500)
  sim.run(ctx)
  sim.edit(controls)

  // on mouse hover highlight hovered particle
  canvas.addEventListener("mousemove", (e) => {
    const pos = new Pos(e.offsetX, e.offsetY)
    sim.highlight(pos, "#00ff00")
  })
  // on mouse click highlight particle neighbors
  canvas.addEventListener("click", (e) => {
    const pos = new Pos(e.offsetX, e.offsetY)
    sim.highlight(pos, "#ff0000")
    // also highlight neighbors
    const neighbors = sim.findNeighbors(pos)
    for (let neighbor of neighbors) {
      sim.highlight(neighbor, "#770000")
    }
  })
}