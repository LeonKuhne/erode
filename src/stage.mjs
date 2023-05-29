

export class Stage {

  constructor() {
    this.zones = []
    console.log("TODO: stage.constructor")
    // create the zones  
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
