import { Pos } from "./pos.mjs"

export class Zone extends Pos {
  constructor(col, row, size) {
    super(col * size, row * size)
    this.particles = []
    this.col = col
    this.row = row
    this.size = size
    this.color = "#aaaaaa"
  }

  fix(size) {
    this.x = this.col * size
    this.y = this.row * size
    this.size = size
  }

  draw(ctx, particleSize) {
    ctx.font = "18px Arial"
    ctx.strokeStyle = this.color
    ctx.fillStyle = this.color
    ctx.strokeRect(this.x-.5, this.y-.5, this.size-.5, this.size-.5)
    ctx.fillText(this.particles.length, this.x-.5 + this.size/3, this.y-.5 + this.size*3/4)
    for (let particle of this.particles) {
      particle.draw(ctx, this, particleSize)
    }
  }

  add(particle) {
    this.particles.push(particle)
  }

  toString() {
    return `table: (${this.col},${this.row}), pos: (${this.x}, ${this.y}), size: ${this.size}`
  }
}