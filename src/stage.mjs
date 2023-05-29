import { Pos } from './pos.mjs'
import { Particle } from './particle.mjs'
import { Zone } from './zone.mjs'

export class Stage {

  constructor() {
    this.minDist = 30 // num pixels
    this.gravity = 3 // pixels per erode tick
    this.cols = 0
    this.rows = 0
    this.width = 0
    this.height = 0
    this.zones = []
  }

  updateSize(width, height) {
    const newCols = Math.ceil(width / this.minDist)
    const newRows = Math.ceil(height / this.minDist)
    this.width = newCols * this.minDist
    this.height = newRows * this.minDist
    this.fixZones(newCols, newRows)
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
          const zone = new Zone(x, y, this.minDist)
          this.zones[x].push(zone)
        }
      }
    }
    this.cols = newCols
    this.rows = newRows
  }

  addParticle(pos, features) {
    const zone = this.getZone(pos)
    const offset = this.getOffset(pos)
    const particle = new Particle(offset, features)
    zone.add(particle)
  }

  getZone(pos) {
    const col = Math.min(Math.floor(pos.x * (this.cols)), this.cols-1) 
    const row = Math.min(Math.floor(pos.y * (this.rows)), this.rows-1)
    return this.zones[col][row]
  }

  getOffset(pos) {
    const xOffset = (pos.x * this.width) % this.minDist
    const yOffset = (pos.y * this.height) % this.minDist
    return new Pos(xOffset, yOffset)
  }

  erode() {
    for (let col of this.zones) {
      for (let zone of col) {
        for (let particle of zone.particles) {
          // apply gravity
          particle.y += this.gravity
          // adjust zone
          this.moveParticle(zone, particle)
        }
      }
    }
  }

  moveParticle(zone, particle) {
    const col = this.wrapColumn(zone.col, particle)
    const row = this.stopRow(zone.row, particle)
    // update zone
    if (col != zone.col || row != zone.row) {
      // remove from prev zone 
      const idx = zone.particles.indexOf(particle)
      zone.particles.splice(idx, 1)
      // add to new zone
      this.zones[col][row].add(particle)
    }
  }

  wrapColumn(col, particle) {
    const offset = Math.floor(particle.x / this.minDist)
    // next/prev zone
    if (offset) {
      particle.x -= this.minDist * offset
      return (this.cols + col + offset) % this.cols
    }
    return col
  }

  stopRow(row, particle) {
    const offset = Math.floor(particle.y / this.minDist)
    // nothing changed
    if (!offset) { return row }
    // reached top
    if (offset < 0 && row == 0) {
      particle.y = 0
      return row
    }
    // reached bottom
    if (offset > 0 && row == this.rows - 1) {
      particle.y = this.minDist
      return row
    }
    // next/prev zone
    particle.y -= this.minDist * offset
    return row + offset
  }

  draw(ctx) {
    ctx.clearRect(0, 0, this.width, this.height)
    for (let col of this.zones) {
      for (let zone of col) {
        zone.draw(ctx)
      }
    }
  }
}
