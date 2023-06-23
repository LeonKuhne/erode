export class Controls {
  constructor() {
    this.elems = {}
  }

  renderTo(parent) {
    // remove bottom elements
    const bottomElems = parent.querySelectorAll(".bottom")
    for (const elem of bottomElems) {
      parent.removeChild(elem)
    }
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
    // add back bottom elements
    for (const elem of bottomElems) {
      parent.appendChild(elem)
    }
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
}