function Tile (options) {
  // Use `object spread properties`
  options = Object.assign({ }, {
    video: {
      x : 0, y : 0
    },
    offset : {
      x : 0, y : 0
    }
  }, options)

  this.Draw     = options.stage.Draw
  this.stage    = options.stage
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
Tile.prototype.isExpanding = function () {
  return this.force > 0.0001
}

Tile.prototype.isContracting = function () {
  return this.rotation !== 0 || this.currentX !== this.originX || this.currentY !== this.originY
}

Tile.prototype.expand = function () {
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

Tile.prototype.contract = function () {
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

Tile.prototype.draw = function () {
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

/*class Tile {
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

    if (this.currentX <= 0 || this.currentX >= sharedState.PAINTRECT.width)
      this.moveX *= -1

    if (this.currentY <= 0 || this.currentY >= sharedState.PAINTRECT.height)
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

    sharedState.Draw[sharedState.currentTileModeName](this, sharedState.drawCtx, !isStill)
  }
}*/

export default Tile
