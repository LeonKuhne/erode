// load in config options from local storage
const configNamesKey = "config-names"
const configNameKey = name => `config-${name}`
const configNames = () => JSON.parse(localStorage.getItem(configNamesKey) || '["default"]')
const configSaves = document.querySelector("#config-saves")

const updateOptions = (name) => {
  configSaves.replaceChildren([])
  for (const name of configNames()) {
    let option = document.createElement("option")
    option.innerText = name
    configSaves.appendChild(option)
  }
  configSaves.value = name
}
updateOptions("default")

window.saveConfig = (name=null) => {
  const nameField = document.querySelector("#config-name")
  name = name || nameField.value
  if (!name) {
    alert("cannot save config with empty name")
    return
  }
  console.log("todo save config with name", name)
  // save the config
  const configs = window.controls.elems
  let config = {}
  for (const name of Object.keys(configs)) {
    config[name] = configs[name].get()
  }
  localStorage.setItem(configNameKey(name), JSON.stringify(config))
  // update names 
  let newNames = configNames()
  if (!newNames.includes(name)) {
    newNames.push(name)
    localStorage.setItem(configNamesKey, JSON.stringify(newNames))
    updateOptions(name)
  }
  nameField.value = ""
}

window.removeConfig = (name=configSaves.value) => {
  if (name == "default") {
    alert("you cant delete the default config")
    return
  }
  localStorage.removeItem(configNameKey(name))
  // update names 
  let names = configNames()
  names.splice(names.indexOf(name), 1)
  localStorage.setItem(configNamesKey, JSON.stringify(names))
  updateOptions(names[names.length-1])
}

window.loadConfig = (name=configSaves.value) => {
  console.log("todo load config with name", name)
  const config = JSON.parse(localStorage.getItem(`config-${name}`) || "{}")
  for (const name in config) {
    const val = config[name]
    window.controls.elems[name].set(val)
  }
}