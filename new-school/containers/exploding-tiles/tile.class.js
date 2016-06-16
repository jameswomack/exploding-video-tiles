/*
  class as syntactic sugar

  
  JavaScript classes are introduced in ECMAScript 6 and are syntactical sugar over JavaScript's existing prototype-based inheritance. The class syntax is not introducing a new object-oriented inheritance model to JavaScript. JavaScript classes provide a much simpler and clearer syntax to create objects and deal with inheritance.
  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes


  In other words: there's no such thing a class in JS. Only class syntax.
*/

export default class Tile {
  constructor (options) {
    // Use `object spread properties`
    options = Object.assign({ }, {
      video: {
        x : 0, y : 0
      },
      offset : {
        x : 0, y : 0
      }
    }, options)

    this.videoX   = options.video.x
    this.videoY   = options.video.y
    this.originX  = options.offset.x + options.video.x
    this.originY  = options.offset.y + options.video.y
    this.currentX = this.originX
    this.currentY = this.originY

    this.rotation     = 0
    this.force        = 0
    this.z            = 0
    this.moveX        = 0
    this.moveY        = 0
    this.moveRotation = 0
  }

  // `Object.setPrototypeOf` ?
  isExpanding () {
    return this.force > 0.0001
  }

  isContracting () {
    return this.rotation !== 0 || this.currentX !== this.originX || this.currentY !== this.originY
  }

  expand () {
    this.moveX *= this.force
    this.moveY *= this.force
    this.moveRotation *= this.force
    this.currentX += this.moveX
    this.currentY += this.moveY
    this.rotation += this.moveRotation
    this.rotation %= 360
    this.force *= 0.9

    if (this.currentX <= 0 || this.currentX >= this.stage.PAINTRECT.width)
      this.moveX *= -1

    if (this.currentY <= 0 || this.currentY >= this.stage.PAINTRECT.height)
      this.moveY *= -1

  }

  contract () {
    const amountToContractBy = 0.2
    const diffx = (this.originX - this.currentX) * amountToContractBy
    const diffy = (this.originY - this.currentY) * amountToContractBy
    const diffRot = (0 - this.rotation) * amountToContractBy

    // TODO: abstract into `diffIsBelowThreshold` or
    // similarly-named method
    if (Math.abs(diffx) < 0.5)
      this.currentX = this.originX
    else
      this.currentX += diffx

    // Ditto
    if (Math.abs(diffy) < 0.5)
      this.currentY = this.originY
    else
      this.currentY += diffy

    // ditto
    if (Math.abs(diffRot) < 0.5)
      this.rotation = 0
    else
      this.rotation += diffRot
  }

  draw () {
    let isStill = false

    if (this.isExpanding())
      this.expand()
    else if (this.isContracting())
      this.contract()
    else {
      this.force = 0
      isStill = true
    }

    this.Draw[this.stage.currentTileModeName](this, this.stage.drawCtx, !isStill)
  }
}
