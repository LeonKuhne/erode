export class Config {

  constructor(settings) {
    this.namesKey = "config-names"
    this.nameKey = name => `config-${name}`
    this.saves = document.querySelector("#config-saves")
    this.updateOptions()
    this.select("default")
    this.settings = settings 
  }

  names() {
    const storedNames = localStorage.getItem(this.namesKey)
    if (!storedNames) {
      return ["default"]
    }
    return JSON.parse(storedNames)
  }

  select(name) {
    if (this.names().includes(name)) {
      this.saves.value = name
    }
  }

  updateOptions() {
    this.saves.replaceChildren([])
    for (const name of this.names()) {
      let option = document.createElement("option")
      option.innerText = name
      this.saves.appendChild(option)
    }
  }

  save(name=null) {
    const nameField = document.querySelector("#config-name")
    name = name || nameField.value
    if (!name) {
      alert("cannot save config with empty name")
      return
    }
    // save the config
    let config = {}
    for (const name of Object.keys(this.settings)) {
      config[name] = this.settings[name].get()
    }
    localStorage.setItem(this.nameKey(name), JSON.stringify(config))
    // update names 
    let newNames = this.names()
    if (!newNames.includes(name)) {
      newNames.push(name)
      localStorage.setItem(this.namesKey, JSON.stringify(newNames))
      this.updateOptions()
    }
    else { nameField.value = "" }
    this.select(name)
  }

  remove(name=this.saves.value) {
    if (name == "default") {
      alert("you cant delete the default config")
      return
    }
    localStorage.removeItem(this.nameKey(name))
    // update names 
    let names = this.names()
    names.splice(names.indexOf(name), 1)
    localStorage.setItem(this.namesKey, JSON.stringify(names))
    this.updateOptions()
    this.select(names[names.length-1])
  }

  load(name=this.saves.value) {
    const config = JSON.parse(localStorage.getItem(`config-${name}`) || "{}")
    for (const name in config) {
      const val = config[name]
      this.settings[name].set(val)
    }
  }
}