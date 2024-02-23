import { Pos } from "./pos.mjs"

export class Track {
  static data = {} 
  static HISTORY_MS = 5000 // how long to capture history for in ms
  static plotters = []

  static mark(key, value) {
    if (!Track.data[key]) {
      Track.data[key] = []
    }
    // insert entry
    const entry = new Pos(Date.now(), value)
    Track.data[key].push(entry)
    Track._update(key)
  }

  static _update(key) {
    // plot lines
    for (let plot of Track.plotters) {
      plot(key, Track.data[key])
    }
    Track._cleanup()
  }

  static _cleanup() {
    for (let key in Track.data) {
      // remove rollover entries
      const cutoff = Date.now() - Track.HISTORY_MS
      while (Track.data[key][0] && Track.data[key][0].x < cutoff) {
        Track.data[key].shift()
      }
      // remove dead entries
      if (!Track.data[key].length) {
        delete Track.data[key]
      }
    }
  }

  static plotTo(setPlot) {
    Track.plotters.push(setPlot)
  }
}