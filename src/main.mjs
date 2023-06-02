import { Sim } from "./sim.mjs"
import { Pos } from "./pos.mjs"

window.onload = () => {
  const canvas = document.getElementById("sim")
  const ctx = canvas.getContext("2d")
  const sim = new Sim()
  sim.updateCanvas(canvas)
  sim.addWater(500)
  sim.addLand(500)
  sim.run(ctx)

  // on mouse hover highlight hovered particle
  canvas.addEventListener("mousemove", (e) => {
    const pos = new Pos(e.offsetX, e.offsetY)
    sim.highlight(pos)
  })
  // on mouse click highlight particle neighbors
  canvas.addEventListener("click", (e) => {
    const mousePos = new Pos(e.offsetX, e.offsetY)
    const zone = sim.stage.getZone(mousePos)
    const particles = sim.stage.findParticles(mousePos)
    if (particles.length) {
      const particle = particles[0]
      sim.highlight(zone, particle)
    }
  })
}