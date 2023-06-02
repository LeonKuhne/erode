import { Pos } from "./pos.mjs"

export class Zone extends Pos {
  constructor(col, row, size) {
    super(col * size, row * size)
    this.particles = []
    this.col = col
    this.row = row
    this.size = size
  }

  draw(ctx, particleSize = 10) {
    // draw zone border 
    const b = 1 // border
    ctx.fillStyle = "#000000"
    ctx.fillRect(this.x+b-.5, this.y+b-.5, this.size-b*2-.5, this.size-b*2-.5)
    // indicate contained particles
    ctx.fillStyle = "#aaaaaa"
    ctx.font = "18px Arial"
    ctx.fillText(this.particles.length, this.x-.5 + this.size/3, this.y-.5 + this.size*3/4)
    // TODO: return an image here and blit it 
    for (let particle of this.particles) {
      const x = this.x + particle.x - particleSize/2 - .5
      const y = this.y + particle.y - particleSize/2 - .5
      ctx.fillStyle = particle.color()
      ctx.fillRect(x, y, particleSize, particleSize)
    }
  }

  add(particle) {
    this.particles.push(particle)
  }
}