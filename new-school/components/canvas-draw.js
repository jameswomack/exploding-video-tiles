const SHADOW_DIVISOR = 70
const SHADOW_BLUR    = 3
const RAD            = Math.PI / 180

// TODO: Opportunity to use string template literals and/or default params?
function rgba (r, g, b, a) {
  return `rgba(${r},${g},${b},${a})`
}

function rgb (r, g, b) {
  return rgba(r, g, b, 1)
}

function addShadow (tile, ctx) {
  ctx.shadowOffsetX = (tile.originX - tile.currentX) / SHADOW_DIVISOR
  ctx.shadowOffsetY = (tile.originY - tile.currentY) / SHADOW_DIVISOR
  ctx.shadowColor   = rgba(255,255,255,0.3)
  ctx.shadowBlur    = SHADOW_BLUR
}

function addArc (tile, ctx, radius) {
  ctx.arc(tile.currentX, tile.currentY, radius, 0, Math.PI * 2, false)
}

function getPixel (tile, ctx) {
  return ctx.getImageData(tile.videoX, tile.videoY, 1, 1).data // expensive
}

export default function createDraw ({ stage }) {
  const Draw = { }

  // TODO: Plenty of opportunities for `const` here
  const pointilismPixelState = { }
  const Cache = { }

  const { copyCanvasEl, Metrics } = stage

  Draw.rectangles = function (tile, ctx, shouldAddShadow) {
    ctx.save()
    ctx.translate(tile.currentX, tile.currentY)

    shouldAddShadow && addShadow(tile, ctx)

    ctx.rotate(tile.rotation * RAD)
    ctx.drawImage(
      copyCanvasEl,
      tile.videoX, tile.videoY,
      Metrics.currentTileMode.TILE_WIDTH, Metrics.currentTileMode.TILE_HEIGHT,
      -Metrics.currentTileMode.TILE_CENTER_WIDTH, -Metrics.currentTileMode.TILE_CENTER_HEIGHT,
      Metrics.currentTileMode.TILE_WIDTH, Metrics.currentTileMode.TILE_HEIGHT
    )
    ctx.restore()
  }

  Draw.ellipses = function (tile, ctx) {
    ctx.save()

    // Create a circle to draw an image into
    ctx.beginPath()
    addArc(tile, ctx, Metrics.currentTileMode.TILE_HEIGHT/2)
    ctx.clip()

    const swidth = Math.max(1, Math.floor(Metrics.currentTileMode.TILE_WIDTH*(stage.videoRatio*10)-tile.videoX))
    const sheight = Math.max(1, Math.floor(Metrics.currentTileMode.TILE_HEIGHT*(stage.videoRatio*10)-tile.videoY))
    const dx = Math.max(1, Math.floor(-(stage.videoRatio*10)+tile.currentX-Metrics.currentTileMode.TILE_WIDTH/2))
    const dy = Math.max(1, Math.floor(-(stage.videoRatio*10)+tile.currentY-Metrics.currentTileMode.TILE_HEIGHT/2))
    ctx.drawImage(copyCanvasEl, tile.videoX, tile.videoY, swidth, sheight, dx, dy, stage.videoWidth, stage.videoHeight)
    ctx.rotate(tile.rotation * RAD)

    // Undo the clipping
    ctx.restore()
  }


  Cache.pointillism = { }
  Draw.pointillism = function (tile, ctx) {
    ctx.save()

    pointilismPixelState[tile.currentX] ||
      (pointilismPixelState[tile.currentX] = { })

    const currentFrame = stage.getCurrentFrame()

    Cache.pointillism[currentFrame] ||
      (Cache.pointillism[currentFrame] = { })
    Cache.pointillism[currentFrame][tile.currentX] ||
      (Cache.pointillism[currentFrame][tile.currentX] = { })

    const currentPixel = Cache.pointillism[currentFrame][tile.currentX][tile.currentY] || (Cache.pointillism[currentFrame][tile.currentX][tile.currentY] = getPixel(tile, stage.copyCtx))

    pointilismPixelState[tile.currentX][tile.currentY] ||
      (pointilismPixelState[tile.currentX][tile.currentY] = currentPixel)

    let pixel = pointilismPixelState[tile.currentX][tile.currentY]

    if (Math.abs(pixel[0] + pixel[1] + pixel[2] - (currentPixel[0] + currentPixel[1] + currentPixel[2])) > 20) {
      pointilismPixelState[tile.currentX][tile.currentY] = currentPixel
      pixel = currentPixel
    }

    ctx.beginPath()

    ctx.fillStyle = rgb(pixel[0], pixel[1], pixel[2])

    addArc(tile, ctx, Metrics.currentTileMode.TILE_HEIGHT/2)

    ctx.fill()
  }

  return Draw
}
