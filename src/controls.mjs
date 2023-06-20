export class Controls {
  constructor() {
    this.elems = []
  }

  renderTo(parent) {
    for (let elem of this.elems.reverse()) {
      parent.prepend(elem)
    }
  }

  bind(name, getValue, setValue, ...settings) {
    // set values from local storage if found
    const storeKey = `controls-${name}`
    let storedValue = localStorage.getItem(storeKey)
    if (storedValue) { 
      storedValue = Number.parseFloat(storedValue)
      setValue(storedValue)
    }
    const setAndStoreValue = (value) => {
      localStorage.setItem(storeKey, value)
      setValue(value)
    } 
    // create, only sliders for now
    const newElem = this._newSlider(name, getValue, setAndStoreValue, ...settings)
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

  _newSlider(name, getValue, setValue, min=0, max=1, scaled=true, step=0.000001) {
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
    slider.value = (getValue() - min) / (max - min)
    let roundValue = (value) => Math.round(value / slider.step) * slider.step
    const valLabel = this._newLabel(roundValue(getValue()))
    const applyScale = document.createElement("input")
    applyScale.type = "checkbox"
    applyScale.title = "apply scale"
    applyScale.checked = scaled
    applyScale.classList.add("scale")
    // adjust slider
    slider.addEventListener("input", (e) => {
      let val = Number.parseFloat(e.target.value)
      if (applyScale.checked) {
        val = Math.pow(val, 2)
      }
      val *= (max - min)
      val += min
      setValue(val)
      valLabel.innerText = 
      valLabel.innerText = Math.round(val / step) * step
    })
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