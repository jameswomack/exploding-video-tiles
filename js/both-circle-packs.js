// Based on http://craftymind.com/factory/html5video/CanvasVideo.html


(function () {
  var videoEl, copyCtx, copyCanvasEl, drawCtx, videoWidth, videoHeight,
      videoRatio, currentTileModeName = 'rectangles', RAD = Math.PI / 180,
      W = window

  var tiles = new Tiles()

  var sourceRect = {
    x: 0, y: 0, width: 0, height: 0
  }

  const pointilismPixelState = { }
  const Draw = { }
  const Metrics = { }
  const Cache = { }
  var tick = null

  const FRAME_RATE = 23.96 // Roughly NTSC

  const PAINTRECT = {
    x: 0, y: 0, width: 0, height: 0
  }

  function copyImage () {
    copyCtx.drawImage(videoEl, 0, 0) // expensive
    drawCtx.clearRect(PAINTRECT.x, PAINTRECT.y, PAINTRECT.width, PAINTRECT.height)
  }


  function processFrame () {
    if (!isNaN(videoEl.duration)) {
      videoHeight = videoEl.videoHeight
      videoWidth  = videoEl.videoWidth
      videoRatio  = videoWidth/videoHeight

      if (sourceRect.width === 0) {
        sourceRect = {
          x: 0, y: 0, width: videoWidth, height: videoHeight
        }
        createTiles()
      }
    }

    copyImage()

    tiles.drawEach()
  }


  function createTiles () {
    var offset = {
      x : Math.floor(Metrics.currentTileMode.TILE_CENTER_WIDTH + (PAINTRECT.width - sourceRect.width) / 2),
      y : Math.floor(Metrics.currentTileMode.TILE_CENTER_HEIGHT + (PAINTRECT.height - sourceRect.height) / 2)
    }
    var y = 0

    while (y < sourceRect.height) {
      var x = 0

      while (x < sourceRect.width) {
        tiles.push(new Tile({
          video : {
            x, y
          },
          offset : Object.assign({ }, offset)
        }))

        x += Metrics.currentTileMode.TILE_WIDTH
      }

      y += Metrics.currentTileMode.TILE_HEIGHT
    }
  }


  function explode (canvasX, canvasY) {
    tiles.reposition(canvasX, canvasY)
    tiles.sort()
    processFrame()
  }


  function pageCoordinatesFromEvent (e) {
    var pageX = 0
    var pageY = 0

    if (e.pageX || e.pageY)
      return e
    else if (e.clientX || e.clientY) {
      pageX = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft
      pageY = e.clientY + document.body.scrollTop  + document.documentElement.scrollTop
    }

    return {
      pageX : pageX,
      pageY : pageY
    }
  }


  const frameCache = { }
  function getCurrentFrame () {
    const key = videoEl.currentTime.toFixed(5)
    frameCache[key] || (frameCache[key] = Math.floor(videoEl.currentTime.toFixed(5) * FRAME_RATE))
    return frameCache[key]
  }


  function dropBomb (evt) {
    var e = evt || window.event
    var el = e.currentTarget

    var coords = pageCoordinatesFromEvent(e)

    explode(coords.pageX - el.offsetLeft, coords.pageY - el.offsetTop)
  }


  function Tile (options) {
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

    if (this.currentX <= 0 || this.currentX >= PAINTRECT.width)
      this.moveX *= -1

    if (this.currentY <= 0 || this.currentY >= PAINTRECT.height)
      this.moveY *= -1

  }

  Tile.prototype.contract = function () {
    var diffx = (this.originX - this.currentX) * 0.2
    var diffy = (this.originY - this.currentY) * 0.2
    var diffRot = (0 - this.rotation) * 0.2

    if (Math.abs(diffx) < 0.5)
      this.currentX = this.originX
    else
      this.currentX += diffx

    if (Math.abs(diffy) < 0.5)
      this.currentY = this.originY
    else
      this.currentY += diffy

    if (Math.abs(diffRot) < 0.5)
      this.rotation = 0
    else
      this.rotation += diffRot
  }

  Tile.prototype.draw = function () {
    var isStill = false

    if (this.isExpanding())
      this.expand()
    else if (this.isContracting())
      this.contract()
    else {
      this.force = 0
      isStill = true
    }

    Draw[currentTileModeName](this, drawCtx, !isStill)
  }

  const SHADOW_DIVISOR = 70
  const SHADOW_BLUR    = 3

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

  // TODO - add a factor parameter that changes based on moveX|Y
  Metrics.rectangles = {
    NAME   : 'rectangles',
    TILE_WIDTH  : 30,
    TILE_HEIGHT : 18,
    FRAME_PROCESSING_INTERVAL : 24,
    TILE_CENTER_WIDTH : 16,
    TILE_CENTER_HEIGHT : 12
  }
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


  Metrics.ellipses = Object.assign({
    NAME : 'ellipses'
  }, Metrics.rectangles)
  Draw.ellipses = function (tile, ctx) {
    ctx.save()

    // Create a circle to draw an image into
    ctx.beginPath()
    addArc(tile, ctx, Metrics.currentTileMode.TILE_HEIGHT/2)
    ctx.clip()

    const swidth = Math.max(1, Math.floor(Metrics.currentTileMode.TILE_WIDTH*(videoRatio*10)-tile.videoX))
    const sheight = Math.max(1, Math.floor(Metrics.currentTileMode.TILE_HEIGHT*(videoRatio*10)-tile.videoY))
    const dx = Math.max(1, Math.floor(-(videoRatio*10)+tile.currentX-Metrics.currentTileMode.TILE_WIDTH/2))
    const dy = Math.max(1, Math.floor(-(videoRatio*10)+tile.currentY-Metrics.currentTileMode.TILE_HEIGHT/2))
    ctx.drawImage(copyCanvasEl, tile.videoX, tile.videoY, swidth, sheight, dx, dy, videoWidth, videoHeight)
    ctx.rotate(tile.rotation * RAD)

    // Undo the clipping
    ctx.restore()
  }

  function getPixel (tile, ctx) {
    return ctx.getImageData(tile.videoX, tile.videoY, 1, 1).data // expensive
  }

  Cache.pointillism = { }
  Metrics.pointillism = Object.assign({ }, Metrics.rectangles, {
    NAME : 'pointillism',
    FRAME_PROCESSING_INTERVAL : 2
  })
  Draw.pointillism = function (tile, ctx) {
    ctx.save()

    pointilismPixelState[tile.currentX] ||
      (pointilismPixelState[tile.currentX] = { })

    const currentFrame = getCurrentFrame()

    Cache.pointillism[currentFrame] ||
      (Cache.pointillism[currentFrame] = { })
    Cache.pointillism[currentFrame][tile.currentX] ||
      (Cache.pointillism[currentFrame][tile.currentX] = { })

    const currentPixel = Cache.pointillism[currentFrame][tile.currentX][tile.currentY] || (Cache.pointillism[currentFrame][tile.currentX][tile.currentY] = getPixel(tile, copyCtx))

    pointilismPixelState[tile.currentX][tile.currentY] ||
      (pointilismPixelState[tile.currentX][tile.currentY] = currentPixel)

    var pixel = pointilismPixelState[tile.currentX][tile.currentY]

    if (Math.abs(pixel[0] + pixel[1] + pixel[2] - (currentPixel[0] + currentPixel[1] + currentPixel[2])) > 20) {
      pointilismPixelState[tile.currentX][tile.currentY] = currentPixel
      pixel = currentPixel
    }

    ctx.beginPath()

    ctx.fillStyle = rgb(pixel[0], pixel[1], pixel[2])

    addArc(tile, ctx, Metrics.currentTileMode.TILE_HEIGHT/2)

    ctx.fill()
  }

  function Tiles () {
    this.array = [ ]
  }

  Tiles.prototype.push = function (tile) {
    if (!(tile instanceof Tile))
      throw new TypeError('Tiles accepts only instances of Tile')

    return this.array.push(tile)
  }

  Tiles.prototype.sort = function () {
    return this.array.sort(zindexSort)
  }

  Tiles.prototype.reposition = function (canvasX, canvasY) {
    return this.array.forEach(getTilePositioningFn(canvasX, canvasY))
  }

  Tiles.prototype.drawEach = function () {
    return this.array.forEach(function (tile) {  tile.draw() })
  }


  function zindexSort (a, b) {
    return a.force - b.force
  }


  function getTilePositioningFn (x, y) {
    return function (tile) {
      var xdiff = tile.currentX - x
      var ydiff = tile.currentY - y
      var dist  = Math.sqrt(xdiff * xdiff + ydiff * ydiff)

      var randRange = 220 + Math.random() * 30
      var range = randRange - dist
      var force = 3 * (range / randRange)

      if (force > tile.force) {
        tile.force = force
        var radians = Math.atan2(ydiff, xdiff)
        tile.moveX = Math.cos(radians)
        tile.moveY = Math.sin(radians)
        tile.moveRotation = 0.5 - Math.random()
      }
    }
  }

  function getNotificationWithPermissions (msg, next) {
    var notification

    if (!('Notification' in window))
      return next(false)
    else if (window.Notification.permission === 'granted')
      return next(true, new window.Notification(msg))
    else if (window.Notification.permission !== 'denied')
      window.Notification.requestPermission(function (permission) {
        if (permission === 'granted')
          return next(true, new window.Notification(msg))
        else
          return next(false)
      })

    return notification
  }

  function updateTileMode () {
    const currentTileModeNameFromLocation = location.hash.replace('#', '')
    currentTileModeName = currentTileModeNameFromLocation || currentTileModeName

    const tileModeUnInitialized = !Metrics.currentTileMode
    const tileModeOutOfSync = tileModeUnInitialized ? true : Metrics.currentTileMode.NAME !== currentTileModeName

    if (tileModeUnInitialized || tileModeOutOfSync) {
      Metrics.currentTileMode = Object.assign({ }, Metrics[currentTileModeName])
      Object.keys(Metrics.currentTileMode).forEach(function (k) {
        document.querySelector('input[name="'+k+'"]').value = Metrics[currentTileModeName][k]
      })
    }
  }

  function updateTick () {
    tick && clearInterval(tick)
    tick = setInterval(processFrame, Metrics.currentTileMode.FRAME_PROCESSING_INTERVAL)
  }

  document.addEventListener('DOMContentLoaded', function () {
    const outputEl = document.getElementById('output')
    PAINTRECT.width  = outputEl.clientWidth
    PAINTRECT.height = outputEl.clientHeight

    videoEl = document.getElementById('sourcevid')

    copyCanvasEl = document.getElementById('sourcecopy')

    copyCtx = copyCanvasEl.getContext('2d', {
      alpha : false
    })
    drawCtx = outputEl.getContext('2d')

    updateTileMode()
    updateTick()

    outputEl.addEventListener('mousedown', dropBomb)
    outputEl.addEventListener('touchend' , dropBomb)

    var inputs =
      document
        .querySelector('form')
        .querySelectorAll('input')

    const onchange = function (e) {
      const el = e.currentTarget
      Metrics.currentTileMode[el.name] = Number(el.value)
      el.name === 'FRAME_PROCESSING_INTERVAL' && updateTick()
      el.name === 'NAME' && (location.hash = '#' + el.value)
    }

    for (var i=0; i < inputs.length; i++) {
      var inputEl = inputs[i]
      inputEl.onchange = onchange
      inputEl.keydown  = onchange
    }

    var worker = new Worker('js/worker.js');
    worker.addEventListener('message', function (e) {
      const hslValues = e.data.result;
      window.colorMap('#color-analysis svg#colorMap', hslValues);
      window.hueBar('#color-analysis svg#hueBar', hslValues);
      window.bothCirclePacks('svg#circlePack', hslValues)

    })

    setInterval(() => {
      if (!videoEl.paused){
        const image = copyCtx.getImageData(100, 100, copyCtx.canvas.width/2, copyCtx.canvas.height/2);
        worker.postMessage({ image })
      }
    }, 1000)

    document.addEventListener('keypress', e =>
      W.matchesKeyCodes(e, [ 112, 32 ]) && W.isNotKeyCombo(e) &&
          videoEl[videoEl.paused ? 'play' : 'pause']())

    const instrEl = document.getElementById('keyboard-event-instructions')
    getNotificationWithPermissions(instrEl.innerText || instrEl.textContent, function (success) {
      !success && instrEl.classList.remove('hide')
    })

    window.addEventListener('hashchange', updateTileMode)
  })

})()
