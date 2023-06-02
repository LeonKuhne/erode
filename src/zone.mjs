export class Zone {
  constructor(col, row, size) {
    this.particles = []
    this.col = col
    this.row = row
    this.x = col * size 
    this.y = row * size
    this.size = size
  }

  draw(ctx, particleSize = 10) {
    // draw zone border
    ctx.fillStyle = "#000000"
    const b = 1 // border
    ctx.fillRect(this.x+b-.5, this.y+b-.5, this.size-b*2-.5, this.size-b*2-.5)
    // show the number of particles contained
    ctx.
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