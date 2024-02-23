import { Track } from "./track.mjs"

export class Controls {
  constructor() {
    this.elems = {}
  }

  renderTo(parent) {
    // create tab buttons
    const tabButtons = document.createElement("div")
    tabButtons.classList.add("tabs")
    const tabElems = {
      settings: (head) => this.renderSettingsTab(head),
      graph: (head) => this.renderGraphTab(head),
    }
    const tab = document.createElement("div")
    for (const tabName of Object.keys(tabElems)) {
      const tabButton = document.createElement("button")
      tabButton.innerText = tabName
      tabButton.addEventListener("click", (e) => {
        tab.innerHTML = ""
        tabElems[tabName](tab)
        // update active button
        e.target.classList.add("active")
        for (const button of tabButtons.querySelectorAll("button")) {
          if (button == e.target) { continue }
          button.classList.remove("active")
        }
      })
      tabButtons.appendChild(tabButton)
    }
    // remove bottom elements
    const bottomElems = parent.querySelectorAll(".bottom")
    for (const elem of bottomElems) {
      parent.removeChild(elem)
    }
    // add tab buttons and tab
    parent.appendChild(tabButtons)
    parent.appendChild(tab)
    // add back bottom elements
    for (const elem of bottomElems) {
      parent.appendChild(elem)
    }
  }

  renderSettingsTab(parent) {
    // add header line
    const header = document.createElement("div")
    header.classList.add("group", "slider", "header")
    header.appendChild(this._newLabel("name"))
    header.appendChild(this._newLabel("min"))
    header.appendChild(this._newLabel("slider"))
    header.appendChild(this._newLabel("max"))
    header.appendChild(this._newLabel("value"))
    header.appendChild(this._newLabel("log"))
    parent.appendChild(header)
    // add controls
    for (let {elem} of Object.values(this.elems)) {
      parent.appendChild(elem)
    }
  }
  
  renderGraphTab(parent) {
    // add graph
    const graph = this._newGraph()
    parent.appendChild(graph)
  }

  bind(name, getValue, setValue, ...settings) {
    this._newSlider(name, getValue, setValue, (newElem, setValue) => {
      this.elems[name] = { elem: newElem, get: getValue, set: setValue }
    }, ...settings)
  }

  _newLabel(name) {
    const label = document.createElement("label")
    label.innerText = name
    return label
  }

  _newField(name, getValue, setValue) {
    const field = document.createElement("input")
    field.title = name
    field.type = "number"
    field.value = getValue()
    field.addEventListener("input", (e) => {
      setValue(Number.parseFloat(e.target.value))
    })
    return field
  }

  _newSlider(name, getValue, setValue, callback, min=0, max=1, scaled=true, step=0.000001) {
    const scale = val => (val - min) / (max - min)
    const label = this._newLabel(name)
    const slider = document.createElement("input")
    const minLabel = this._newField("min", () => min, (val) => {
      min = val
      slider.dispatchEvent(new Event("input"))
    })
    const maxLabel = this._newField("max", () => max, (val) => {
      max = val
      slider.dispatchEvent(new Event("input"))
    })
    slider.type = "range"
    slider.title = name
    slider.min = 0
    slider.max = 1
    slider.step = step
    slider.value = scale(getValue())
    let roundValue = (value) => Math.round(value / slider.step) * slider.step
    const valLabel = this._newLabel(roundValue(getValue()))
    const applyScale = document.createElement("input")
    applyScale.type = "checkbox"
    applyScale.title = "apply scale"
    applyScale.checked = scaled
    applyScale.classList.add("scale")
    // on set value also update slider AND keep default behavior
    const origSetValue = setValue
    setValue = (val) => {
      origSetValue(val)
      slider.value = scale(val)
      valLabel.innerText = roundValue(val)
    }
    // adjust slider
    slider.addEventListener("input", (e) => {
      let val = Number.parseFloat(e.target.value)
      if (applyScale.checked) {
        val = Math.pow(val, 2)
      }
      val *= (max - min)
      val += min
      valLabel.innerText = Math.round(val / step) * step
      setValue(val)
      window.config.save("-", this.elems)
    })
    // create group
    const group = document.createElement("div")
    group.classList.add("group", "slider")
    group.appendChild(label)
    group.appendChild(minLabel)
    group.appendChild(slider)
    group.appendChild(maxLabel)
    group.appendChild(valLabel)
    group.appendChild(applyScale)
    callback(group, setValue)
  }

  _newGraph() {
    // ceate a select for the yAxis
    const yAxis = document.createElement("stats")
    const enabledAxis = {}
    // add multiple attribute
    yAxis.multiple = true
    const updateYAxisStats = () => {
      // add options that are not already there
      for (let key in Track.data) {
        if (yAxis.querySelector(`.stat[value="${key}"]`)) { continue }
        const stat = document.createElement("button")
        stat.classList.add("stat")
        stat.value = key
        stat.innerText = key
        // mark as active on click
        stat.addEventListener("click", (e) => {
          e.target.classList.toggle("active")
          if (!e.target.classList.contains("active")) {
            delete enabledAxis[key]
          } else {
            enabledAxis[key] = true
          }
        })
        // create label
        yAxis.appendChild(stat)
      }
      // remove stats that are no longer there
      for (let stat of yAxis.querySelectorAll('.stat')) {
        if (Track.data[stat.value]) { continue }
        yAxis.removeChild(stat)
      }
      yAxis.size = yAxis.querySelectorAll('.stat').length
    }
    updateYAxisStats()
    // create a canvas that has linesegments
    const canvas = document.createElement("canvas")
    canvas.classList.add("graph")
    const ctx = canvas.getContext("2d")
    ctx.font = "32px Arial"
    ctx.fillStyle = "white"
    // create a callback to plot a point, scale for canvas size
    const plotPoint = (key, points) => {
      updateYAxisStats()
      if (key in enabledAxis) { return }
      // clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      // label yAxis
      ctx.save()
      ctx.translate(0, canvas.height / 2)
      ctx.rotate(-Math.PI / 2)
      ctx.fillText(key, -canvas.height/4, 18)
      ctx.restore()
      // get max and min
      if (!points.length) { return }
      const minX = points[0].x
      const maxX = points[points.length - 1].x
      const rangeX = maxX - minX 
      let minY = points.reduce((min, pos) => Math.min(min, pos.y), Number.MAX_VALUE)
      let maxY = points.reduce((max, pos) => Math.max(max, pos.y), Number.MIN_VALUE)
      let rangeY = maxY - minY
      if (minY == maxY) { return }
      // plot lines 
      ctx.strokeStyle = "white"
      ctx.lineWidth = 1
      ctx.beginPath()
      // start line
      let from = points[0]
      for (let i = 1; i < points.length; i++) {
        let to = points[i]
        // normalize and scale
        to.x = (to.x - minX) / rangeX * canvas.width
        to.y = (1 - (to.y - minY) / rangeY) * canvas.height
        if (Number.isNaN(to.x) || Number.isNaN(to.y)) {
          console.log("pause")
        }
        ctx.moveTo(from.x, from.y)
        ctx.lineTo(to.x, to.y)
        from = to 
      }
      ctx.stroke()
      ctx.closePath()
    }
    yAxis.addEventListener("change", () => {
      const key = yAxis.value 
      plotPoint(key, Track.data[key])
    })
    Track.plotTo(plotPoint)
    // create a group
    const group = document.createElement("div")
    group.classList.add("group", "plotter")
    group.appendChild(yAxis)
    group.appendChild(canvas)
    return group
  }
}