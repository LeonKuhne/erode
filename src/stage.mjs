import { Pos } from './pos.mjs'
import { Particle } from './particle.mjs'
import { Zone } from './zone.mjs'
import { MarchingSquares } from './squares.mjs'

export class Stage {

  // @param gridSize size of each zone in pixels
  constructor(gridSize, particleSize) {
    this.minDist = gridSize
    this.particleSize = particleSize
    this.airFriction = 0.35
    this.heatSpeed = 0.08
    this.cols = 0
    this.rows = 0
    this.width = 0
    this.height = 0
    this.minCombineDistance = 0.1
    this.minCombineSpeed = 0.1
    this.minCombineHeat = 0.1
    this.showBorder = true
    this.zones = []
    this.highlighted = {}
    this.squareOpacity = 0.25
    this.squares = new MarchingSquares()
  }

  updateCanvas(canvas, width=canvas.width, height=canvas.height, size=this.minDist) {
    this.updateSize(width, height, size)
    canvas.width = this.width
    canvas.height = this.height
    this.squares.renderShapes(size)
  }

  updateSize(width, height, size=this.minDist) {
    this.minDist = size
    const newCols = Math.ceil(width / this.minDist)
    const newRows = Math.ceil(height / this.minDist)
    this.width = newCols * this.minDist
    this.height = newRows * this.minDist
    this.fixZones(newCols, newRows)
  }

  setBrightness(x) {
    this.showBorder = !!x
    this.eachZone(zone => {
      zone.color = `rgb(${x}, ${x}, ${x})`
    })
  }

  // assumes oldCols > newCols
  removeColumns(newCols) {
    const deletedCols = this.zones.splice(newCols, this.cols - newCols)
    // move particles from deleted zones
    for (let col of deletedCols) {
      for (let zone of col) {
        for (let particle of zone.particles) {
          const newCol = zone.col % this.cols 
          // add particle to new zone
          const newZone = this.zones[newCol][zone.row]
          newZone.particles.push(particle)
          particle.zone = newZone
        }
        zone.particles = []
      }
    }
  }

  // assumes oldRows > newRows
  removeRows(newRows) {
    // remove rows
    for (let x=0;x<this.zones.length;x++) {
      const deletedRows = this.zones[x].splice(this.rows, newRows)
      for (let zone of deletedRows) {
        for (let particle of zone.particles) {
          const newRow = zone.row % newRows
          const newZone = this.zones[zone.col][newRow]
          newZone.particles.push(particle)
          particle.zone = newZone
        }
        zone.particles = []
      }
    }
  }

  // assumes newCols > oldCols
  addColums(cols) {
    for (let x=this.cols;x<cols;x++) {
      this.zones.push([])
      for (let y=0;y<this.rows;y++) {
        const zone = new Zone(x, y, this.minDist)
        this.zones[x].push(zone)
      }
    }
  }

  // assumes newRows > oldRows
  addRows(rows) {
    for (let x=0;x<this.cols;x++) {
      for (let y=this.rows;y<rows;y++) {
        const zone = new Zone(x, y, this.minDist)
        this.zones[x].push(zone)
      }
    }
  }

  fixZones(newCols, newRows) {
    if (this.cols != newCols) { 
      this.fixCols(newCols)
    } if (this.rows != newRows) {
      this.fixRows(newRows) 
    }
    const oldCols = this.cols
    const oldRows = this.rows 
    this.eachZone(zone => zone.fix(this.minDist))
    if (this.cols != this.zones.length || this.zones && this.rows != this.zones[0].length) {
      console.warn(`failed fixing zones!!! ${oldCols}x${oldRows} -> ${this.cols}x${this.rows} != ${this.zones.length}x${this.zones ? this.zones[0].length : null}`)
    }
  }

  fixCols(cols) {
    if (cols <= this.cols) { 
      this.removeColumns(cols)
    } else {
      this.addColums(cols)
    }
    this.cols = cols
  }

  fixRows(rows) {
    if (rows <= this.rows) { 
      this.removeRows(rows)
    } else {
      this.addRows(rows)
    }
    this.rows = rows
  }

  addParticle(pos, features) {
    // verify mass start is not 0 
    if (!features['mass start']) {
      throw new Error("mass start must not be 0")
    }
    // add additional features
    features['mass multiplyer'] = 1
    features.mass = () => features['mass start']() * features['mass multiplyer']
    // add particle to zone
    const zone = this.getZone(pos)
    const offset = this.getOffset(pos)
    const particle = new Particle(zone, offset, features)
    zone.insert(particle)
  }

  // @param pos position in normalized coordinates  
  getZone(pos) {
    const toGrid = (val, sections) => Math.min(Math.floor(val * (sections)), this.cols-1) 
    const col = toGrid(pos.x, this.cols)
    const row = toGrid(pos.y, this.rows)
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
    this.eachParticleNeighbors(callback)
    this.eachParticleZone((particle, zone) => {
      // apply deltas
      particle.apply(this.airFriction, this.heatSpeed)
      this.moveParticle(zone, particle)
    })
    this.eachParticleZone((particle, zone) => {
      // consolidate
      for (const {particle: other, zone: otherZone, offset, distance} of this.getNearbyParticles(particle, zone)) {
        if (distance < this.minCombineDistance) {
          const isSlow = p => p.vel.magnitude() < this.minCombineSpeed
          if (isSlow(particle) && isSlow(other)) {
            const isCold = p => p.feat('heat') < this.minCombineHeat
            if (isCold(particle) && isCold(other)) {
              this.combineParticles(zone, particle, otherZone, other)
            }
          }
        }
      }
    })
    // remove all particles with zero mass
    this.eachParticleZone((particle, zone) => {
      if (!particle.feat('mass multiplyer')) {
        zone.remove(particle)
      }
    })
  }

  combineParticles(zone, particle, otherZone, other) {
    const otherMassRatio = other.feat('mass') / particle.feat('mass')
    // heat
    particle.features['heat'] += other.feat('heat') * otherMassRatio
    // velocity
    const otherMomentum = other.vel.clone()
    otherMomentum.multiply(otherMassRatio)
    particle.vel.add(otherMomentum)
    // average position
    const absPos = zone.clone()
    absPos.add(particle)
    const delta = otherZone.clone()
    delta.add(other)
    delta.subtract(absPos)
    delta.divide(2)
    particle.add(delta)
    this.moveParticle(zone, particle)
    // combine mass
    particle.features['mass multiplyer'] += other.feat('mass multiplyer')
    other.features['mass multiplyer'] = 0
  }

  findNeighbors(particle) {
    return this.getNearbyParticles(particle, particle.zone)
  }

  getNearbyParticles(particle, zone) {
    const particles = []
    for (let {zone: nearZone, offset} of this.getNearby(zone)) {
      for (let other of nearZone.particles) {
        // ignore self
        if (other == particle) continue
        // out of range
        const nOffset = offset.clone()
        nOffset.multiply(this.minDist)
        const distance = particle.distance(other, nOffset)
        if (distance > this.minDist) continue
        particles.push({
          particle: other, 
          zone: nearZone,
          offset: offset,
          distance: distance,
        })
      }
    }
    return particles
  }

  eachParticleNeighbors(callback) {
    this.eachZone(zone => {
      for (let particle of zone.particles) {
        const nearbyParticles = this.getNearbyParticles(particle, zone)
        callback(particle, nearbyParticles)
      }
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
      const newZone = this.zones[col][row]
      newZone.insert(particle)
      // update particle zone
      particle.zone = newZone
    }
  }

  wrapColumn(col, particle) {
    let newCol = col
    let offset = Math.floor(particle.x / this.minDist)
    // next/prev zone
    if (offset) {
      // fix particle zone position
      particle.x %= this.minDist
      if (particle.x < 0) {
        particle.x -= this.minDist * offset
      }
      // wrap sides
      const screenNumOffset = Math.floor(particle.x / this.width)
      offset += screenNumOffset * this.cols
      newCol += offset
      newCol %= this.cols
      newCol = Math.abs(newCol)
    }
    return newCol
  }

  stopRow(row, particle) {
    const offset = Math.floor(particle.y / this.minDist)
    // nothing changed
    if (!offset) { return row }
    // reached top
    if (row + offset < 0) {
      particle.y = 0
      particle.vel.y = 0
      return row
    }
    // reached bottom
    if (row + offset >= this.rows) {
      particle.y = this.minDist
      particle.vel.y = 0
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
    ctx.fillStyle = "#000000"
    ctx.fillRect(0, 0, this.width, this.height)
    let grid = []
    for (let col of this.zones) {
      let gridCol = [0] // top row water
      for (let zone of col) {
        // comment this line for caves only
        zone.draw(ctx, this.particleSize, this.showBorder)
        // recompute ratio
        let nLand = zone.particles.filter(p => p.feat("name") != "water").length
        let landRatio = nLand / zone.particles.length
        gridCol.push(landRatio > 0.5 ? 1 : 0)
      }
      gridCol.push(1) // bot row land
      grid.push(gridCol)
    }
    // marching squares
    ctx.globalAlpha = this.squareOpacity
    for (let x=0;x<=this.cols;x++) {
      // support wrapping
      let left = (x == 0 ? grid.length : x) - 1
      let right = x == grid.length ? 0 : x 
      for (let y=1;y<this.rows+2;y++) {
        let corners = [
          grid[left][y-1],   // top left
          grid[right][y-1],  // top right
          grid[right][y],    // bot right
          grid[left][y],     // bot left
        ]
        let idx = parseInt(corners.join(''), 2)
        // render the shape
        let shapeX = (x-1) * this.minDist
        let shapeY = (y-2) * this.minDist 
        let shape = this.squares.shapes[idx]
        ctx.drawImage(shape, shapeX, shapeY)
      }
    }
    ctx.globalAlpha = 1
    // highlight
    if (this.highlighted) {
      for (let neighbor of Object.values(this.highlighted)) {
        // check if particles is a list of particles
        if (neighbor instanceof Array) {
          for (let n of neighbor) {
            const {particle, color, withNeighbors} = n
            this.drawParticle(ctx, particle, color, withNeighbors)
          }
        } else {
          const {particle, color, withNeighbors} = neighbor
          this.drawParticle(ctx, particle, color, withNeighbors)
        }
      }
    }
  }

  drawParticle(ctx, particle, color, withNeighborsColored=null) {
    particle.draw(ctx, particle.zone, this.particleSize, color)
    if (withNeighborsColored) {
      // find neighbors
      const nearby = this.getNearbyParticles(particle, particle.zone)
      for (let n of nearby) {
        n.particle.draw(ctx, n.zone, this.particleSize, withNeighborsColored)
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
