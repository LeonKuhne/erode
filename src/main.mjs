import { Sim } from "./sim.mjs"
import { Pos } from "./pos.mjs"

window.onload = () => {
  const canvas = document.getElementById("sim")
  const controls = document.getElementById("controls")
  const ctx = canvas.getContext("2d")
  const sim = new Sim()
  sim.updateCanvas(canvas)
  sim.run(ctx)
  sim.edit(controls)
  const mousePos = new Pos(0, 0)

  // on 'a' key pressed add water
  document.addEventListener("keypress", (e) => {
    if (e.key == 'a') {
      sim.addWater(mousePos.clone())
    }
  })

  // on mouse hover highlight hovered particle
  canvas.addEventListener("mousemove", (e) => {
    mousePos.x = e.offsetX
    mousePos.y = e.offsetY
    sim.highlight(mousePos, "#00ff00", "#00aa00", 1)
  })
  // on mouse click highlight particle neighbors
  canvas.addEventListener("click", (e) => {
    const pos = new Pos(e.offsetX, e.offsetY)
    sim.highlight(pos, "#ff0000", "#aa0000", 1)
  })
}