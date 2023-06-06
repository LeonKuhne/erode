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
    const newElem = this._newSlider(name, getValue, setValue, ...settings)
    this.elems.push(newElem)
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

  _newSlider(name, getValue, setValue, min=0, max=1, step=0.001) {
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
    const valLabel = this._newLabel(getValue())
    const applyScale = document.createElement("input")
    applyScale.type = "checkbox"
    applyScale.title = "apply scale"
    applyScale.checked = true
    applyScale.classList.add("scale")
    slider.type = "range"
    slider.title = name
    slider.value = (getValue() - min) / (max - min)
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