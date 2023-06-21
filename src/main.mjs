import { Sim } from "./sim.mjs"
import { Pos } from "./pos.mjs"
import { Controls } from "./controls.mjs"

window.onload = () => {
  const border = 120
  const canvas = document.getElementById("sim")
  canvas.width = document.body.clientWidth - border
  canvas.height = document.body.clientHeight - border
  const controlsElem = document.getElementById("controls")
  window.controls = new Controls()
  const sim = new Sim(canvas)
  sim.bind(window.controls)
  window.controls.renderTo(controlsElem)
  window.saveConfig("default")
  sim.run()
  const mousePos = new Pos(0, 0)

  // show controls
  let lastAdjustment = 0
  let minDelay = 250
  const now = () => new Date().valueOf()
  const whenAdjustable = (callback) => {
    if (lastAdjustment + minDelay <= now() ) {
      callback()
      lastAdjustment = now()
    }
  }
  controlsElem.addEventListener("mouseenter", () => {
    whenAdjustable(() => {
      if (controlsElem.classList.contains("hide")) {
        controlsElem.classList.remove("hide")
      }
      controlsElem.classList.add("show")
    })
  })
  canvas.addEventListener("mouseenter", () => {
    whenAdjustable(() => {
      controlsElem.classList.remove("show")
      controlsElem.classList.add("hide")
    })
  })

  // add particles
  document.addEventListener("keypress", (e) => {
    if (e.key == '1') {
      sim.addWater(mousePos.clone())
    } else if (e.key == '2') {
      sim.addLand(mousePos.clone())
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