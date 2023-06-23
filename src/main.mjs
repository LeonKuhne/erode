import { Sim } from "./sim.mjs"
import { Pos } from "./pos.mjs"
import { Controls } from "./controls.mjs"
import { Config } from "./config.mjs"

window.onload = () => {
  const border = 120
  const canvas = document.getElementById("sim")
  canvas.width = document.body.clientWidth - border
  canvas.height = document.body.clientHeight - border
  const controlsElem = document.getElementById("controls")
  const mousePos = new Pos(0, 0)
  window.controls = new Controls()
  window.config = new Config(window.controls.elems)
  window.sim = new Sim(canvas, window.controls)
  // render controls to element
  window.controls.renderTo(controlsElem)
  window.config.save("default")
  window.config.load("-")
  window.config.select("-")
  window.sim.run()

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
      window.sim.addWater(mousePos.clone())
    } else if (e.key == '2') {
      window.sim.addLand(mousePos.clone())
    }
  })

  // on mouse hover highlight hovered particle
  canvas.addEventListener("mousemove", (e) => {
    mousePos.x = e.offsetX
    mousePos.y = e.offsetY
    window.sim.highlight(mousePos, "#00ff00", "#00aa00", 1)
  })

  // on mouse click highlight particle neighbors
  canvas.addEventListener("click", (e) => {
    const pos = new Pos(e.offsetX, e.offsetY)
    window.sim.highlight(pos, "#ff0000", "#aa0000", 1)
  })
}