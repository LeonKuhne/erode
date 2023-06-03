import { Pos } from './pos.mjs'
import { Particle } from './particle.mjs'
import { Zone } from './zone.mjs'

export class Stage {

  // @param gridSize size of each zone in pixels
  constructor(gridSize, particleSize) {
    this.minDist = gridSize
    this.particleSize = particleSize
    this.cols = 0
    this.rows = 0
    this.width = 0
    this.height = 0
    this.zones = []
    this.highlighted = {}
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

  // @param pos position in normalized coordinates  
  getZone(pos) {
    const col = Math.min(Math.floor(pos.x * (this.cols)), this.cols-1) 
    const row = Math.min(Math.floor(pos.y * (this.rows)), this.rows-1)
    return this.zones[col][row]
  }

  // @param pos position in normalized coordinates
  getOffset(pos) {
    const xOffset = (pos.x * this.width) % this.minDist
    const yOffset = (pos.y * this.height) % this.minDist
    return new Pos(xOffset, yOffset)
  }

  update(callback) {
    // calculate deltas 
    this.eachNeighbors((particle, neighbors) => {
      callback(particle, neighbors)
    })
    // apply positions and fix zones
    this.eachParticleZone((particle, zone) => {
      particle.applyForces()
      this.moveParticle(zone, particle)
    })
  }

  eachParticleZone(callback) {
    for (let col of this.zones) {
      for (let zone of col) {
        for (let i=0;i<zone.particles.length;i++) {
          const particle = zone.particles[i]
          callback(particle, zone)
        }
      }
    }
  }

  eachZone(callback) {
    for (let column of this.zones) {
      for (let z=0;z<column.length;z++) {
        callback(column[z])
      }
    }
  }

  getNearby(zone) {
    const nearby = []
    // get nearby
    for (let c=-1;c<2;c++) {
      for (let r=-1;r<2;r++) {
        let col = zone.col + c
        const row = zone.row + r
        // wrap sides
        if (col < 0) {
          col += this.cols
        } else if (col >= this.cols) {
          col -= this.cols
        // ignore top/bottom edges
        } if (row < 0 || row >= this.rows) {
          continue
        }
        nearby.push({
          zone: this.zones[col][row],
          offset: new Pos(c, r)
        })
      }
    }
    return nearby
  }
    
  eachNeighbors(callback) {
    this.eachZone(zone => {
      const nearby = this.getNearby(zone)
      for (let particle of zone.particles) {
        callback(particle, nearby)
      }
    })
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
    let offset = Math.floor(particle.x / this.minDist)
    // next/prev zone
    if (offset) {
      particle.x %= this.minDist
      if (particle.x < 0) {
        particle.x -= this.minDist * offset
      }
      // wrap sides
      while (offset < 0) offset += this.cols
      return (col + offset) % this.cols
    }
    return col
  }

  stopRow(row, particle) {
    const offset = Math.floor(particle.y / this.minDist)
    // nothing changed
    if (!offset) { return row }
    // reached top
    if (row + offset < 0) {
      particle.y = 0
      return row
    }
    // reached bottom
    if (row + offset >= this.rows) {
      particle.y = this.minDist
      return row
    }
    // next/prev zone
    particle.y %= this.minDist
    if (particle.y < 0) {
      particle.y -= this.minDist * offset
    }
    return row + offset
  }

  draw(ctx) {
    ctx.clearRect(0, 0, this.width, this.height)
    for (let col of this.zones) {
      for (let zone of col) {
        zone.draw(ctx, this.particleSize)
      }
    }
    // highlight
    if (this.highlighted) {
      for (let {zone, particle, color} of Object.values(this.highlighted)) {
        particle.draw(ctx, zone, this.particleSize, color)
      }
    }
  }

  // @param pos position in normalized coordinates
  findParticles(pos) {
    const zone = this.getZone(pos)
    const nearby = this.getNearby(zone)
    const localPos = this.getOffset(pos)
    // find particles within range
    const particles = []
    for (let neighbor of nearby) {
      neighbor.offset.multiply(this.minDist)
      for (let particle of neighbor.zone.particles) {
        const dist = particle.distance(localPos, neighbor.offset)
        if (dist < this.particleSize) {
          particles.push(particle)
        }
      }
    }
    return particles
  }
}
