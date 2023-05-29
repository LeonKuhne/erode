

export class Stage {

  constructor() {
    this.minDist = 30 // num pixels
    this.width = 0
    this.height = 0
    this.cols = 0
    this.rows = 0
    this.zones = []
  }

  updateSize(width, height) {
    this.width = width
    this.height = height
    const newCols = width / this.minDist
    const newRows = height / this.minDist
    this.fixZones(Math.ceil(newCols), Math.ceil(newRows))
  }

  fixZones(newCols, newRows) {
    // adjust column length
    if (newCols < this.cols) { 
      this.zones = this.zones.splice(0, newCols)
    } else {
      for (let x=this.cols;x<newCols;x++) {
        this.zones.push([])
      }
    }
    // adjust row length
    for (let x=this.cols;x<newCols;x++) {
      if (newRows < this.rows) { 
        this.zones[x] = this.zones[x].splice(0, numRows)
      } else {
        for (let y=this.rows;y<newRows;y++) {
          this.zones[x].push([])
        }
      }
    }
    this.cols = newCols
    this.rows = newRows
  }

  // expects x/y to be between 0-1
  addElement(element, x, y) {
    console.log("TODO: stage.addElement")
    // find the zone x/y belongs to
    // fix coordinate to be relative to the zone
    // add element to that zone
  }

  toRelPos(x, y) {
    console.log("TODO: stage.toRelPos")
  }

  erode() {
    console.log("TODO: stage.erode")
  }

  draw(ctx) {
    console.log("TODO: stage.draw")
  }
}
