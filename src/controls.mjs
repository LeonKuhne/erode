export class Controls {
  constructor() {
    this.ranges = {}
    this.elems = []
  }

  renderTo(parent) {
    for (let elem of this.elems) {
      parent.appendChild(elem)
    }
  }

  bind(name, getValue, setValue, ...settings) {
    this.ranges[name] = {getValue, setValue}
    // TEMP only sliders for now
    const newElem = this._createSlider(name, getValue, setValue, ...settings)
    this.elems.push(newElem)
  }

  _newLabel(name) {
    const label = document.createElement("label")
    label.innerText = name
    return label
  }

  _createSlider(name, getValue, setValue, min=0, max=1, step=0.001) {
    const label = this._newLabel(name)
    const minLabel = this._newLabel(min)
    const maxLabel = this._newLabel(max)
    const valLabel = this._newLabel(getValue())
    const applyScale = document.createElement("input")
    applyScale.type = "checkbox"
    applyScale.title = "apply scale"
    applyScale.checked = true
    applyScale.classList.add("scale")
    const slider = document.createElement("input")
    slider.type = "range"
    slider.title = name
    slider.value = getValue()
    slider.addEventListener("input", (e) => {
      let val = Number.parseFloat(e.target.value)
      if (applyScale.checked) {
        val = Math.pow(val, 2)
      }
      val *= (max - min)
      val += min
      setValue(val)
      valLabel.innerText = Math.round(val / step) * step
    })
    // set max and min values for slider
    slider.min = 0
    slider.max = 1
    slider.step = step
    const group = document.createElement("div")
    group.classList.add("group", "slider")
    group.appendChild(label)
    group.appendChild(minLabel)
    group.appendChild(slider)
    group.appendChild(maxLabel)
    group.appendChild(valLabel)
    group.appendChild(applyScale)
    return group
  }

}