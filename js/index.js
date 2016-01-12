
// Based on http://craftymind.com/factory/html5video/CanvasVideo.html


(function () {

  var videoEl
  var copyCtx
  var copyCanvasEl
  var drawCtx
  var videoWidth
  var videoHeight
  var videoRatio
  var tileMode = 'rectangles'

  var pointilismHistory = {};

  var RAD   = Math.PI / 180
  var tiles = new Tiles()

  var sourceRect = {
    x: 0, y: 0, width: 0, height: 0
  }

  var FRAME_PROCESSING_INTERVAL = 2
  var TILE_WIDTH = 12
  var TILE_HEIGHT = 12
  var TILE_CENTER_WIDTH = 16
  var TILE_CENTER_HEIGHT = 12
  var PAINTRECT = {
    x: 0, y: 0, width: 1000, height: 600
  }


  function copyImage () {
    copyCtx.drawImage(videoEl, 0, 0)
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
      x : TILE_CENTER_WIDTH + (PAINTRECT.width - sourceRect.width) / 2,
      y : TILE_CENTER_HEIGHT + (PAINTRECT.height - sourceRect.height) / 2
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

        x += TILE_WIDTH
      }

      y += TILE_HEIGHT
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


  function dropBomb (evt) {
    var e = evt || window.event
    var el = e.currentTarget

    var coords = pageCoordinatesFromEvent(e)

    explode(coords.pageX - el.offsetLeft, coords.pageY - el.offsetTop)
  }


  function Tile (options) {
    if (!options) {
      options = {
        video: {
          x : 0, y : 0
        },
        offset : {
          x : 0, y : 0
        }
      }
    }
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

  Tile.prototype.draw = function () {
    var isExpanding   = this.force > 0.0001
    var isContracting = this.rotation !== 0 || this.currentX !== this.originX || this.currentY !== this.originY
    var   isStill

    if (isExpanding) {
      //expand
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

    } else if (isContracting) {
      //contract
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

    } else {
      this.force = 0
      isStill = true
    }

    tileMode === 'ellipses' ? drawEllipses(this, drawCtx, !isStill) : drawSquares(this, drawCtx, !isStill)
  }

  var SHADOW_DIVISOR = 70
  var SHADOW_BLUR    = 3

  function addShadow (tile, ctx) {
    ctx.shadowOffsetX = (tile.originX - tile.currentX) / SHADOW_DIVISOR
    ctx.shadowOffsetY = (tile.originY - tile.currentY) / SHADOW_DIVISOR
    ctx.shadowColor   = 'rgba(255,255,255,0.3)'
    ctx.shadowBlur    = SHADOW_BLUR
  }

  function drawSquares (tile, ctx, shouldAddShadow) {
    ctx.save()
    ctx.translate(tile.currentX, tile.currentY)

    shouldAddShadow && addShadow(tile, ctx)

    ctx.rotate(tile.rotation * RAD)
    ctx.drawImage(copyCanvasEl, tile.videoX, tile.videoY, TILE_WIDTH, TILE_HEIGHT, -TILE_CENTER_WIDTH, -TILE_CENTER_HEIGHT, TILE_WIDTH, TILE_HEIGHT)
    ctx.restore()
  }

  function drawEllipses (tile, ctx) {
    ctx.save()

    // Create a circle
//    ctx.beginPath()

//    ctx.arc(tile.currentX, tile.currentY, TILE_HEIGHT, 0, Math.PI * 2, false)

    // Clip to the current path
//    ctx.clip();
//    ctx.drawImage(copyCanvasEl, tile.videoX, tile.videoY, TILE_WIDTH*(videoRatio*10), TILE_HEIGHT*(videoRatio*10), -(videoRatio*10)+tile.currentX-TILE_WIDTH/2, -(videoRatio*10)+tile.currentY-TILE_HEIGHT/2, videoWidth, videoHeight)

    if (!pointilismHistory[tile.currentX]) {
      pointilismHistory[tile.currentX] = {};
    }

    myImageData = copyCtx.getImageData(tile.currentX, tile.currentY, 1, 1);

    if (!pointilismHistory[tile.currentX][tile.currentY]) {
      pointilismHistory[tile.currentX][tile.currentY] = myImageData.data;
    }

    if (Math.abs((pointilismHistory[tile.currentX][tile.currentY][0] + pointilismHistory[tile.currentX][tile.currentY][1] + pointilismHistory[tile.currentX][tile.currentY][2]) - (myImageData.data[0] + myImageData.data[1] + myImageData.data[2])) > 20) {
      pointilismHistory[tile.currentX][tile.currentY] = myImageData.data;
    }


//    console.log(myImageData.data[0] + "," + myImageData.data[1] + "," + myImageData.data[2])

//    ctx.drawImage(copyCanvasEl, tile.videoX, tile.videoY, TILE_WIDTH*(videoRatio*10), TILE_HEIGHT*(videoRatio*10), -(videoRatio*10)+tile.currentX-TILE_WIDTH/2, -(videoRatio*10)+tile.currentY-TILE_HEIGHT/2, videoWidth, videoHeight)
    //ctx.drawImage(copyCanvasEl, tile.videoX, tile.videoY, TILE_WIDTH*videoRatio, TILE_HEIGHT*videoRatio, -videoRatio+tile.currentX-TILE_WIDTH/2, -videoRatio+tile.currentY-TILE_HEIGHT/2, videoWidth, videoHeight)

    ctx.beginPath();
    ctx.fillStyle = "rgb(" + pointilismHistory[tile.currentX][tile.currentY][0] + "," + pointilismHistory[tile.currentX][tile.currentY][1] + "," + pointilismHistory[tile.currentX][tile.currentY][2] + ")";
//    ctx.fillStyle = "blue";
    ctx.arc(tile.currentX, tile.currentY, TILE_HEIGHT / 2, 0, Math.PI * 2);
    ctx.fill();

//    ctx.rotate(tile.rotation * RAD)

    // Undo the clipping
//    ctx.restore()
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
    return this.array.forEach(tile => tile.draw())
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
    tileMode = location.hash === '#ellipses' ? 'ellipses' : 'rectangles'
  }

  document.addEventListener('DOMContentLoaded', function () {
    var outputEl = document.getElementById('output')

    videoEl = document.getElementById('sourcevid')

    copyCanvasEl = document.getElementById('sourcecopy')

    copyCtx = copyCanvasEl.getContext('2d', {
      alpha : false
    })
    drawCtx = outputEl.getContext('2d')

    setInterval(processFrame, FRAME_PROCESSING_INTERVAL)

    outputEl.addEventListener('mousedown', dropBomb)
    outputEl.addEventListener('touchend' , dropBomb)

    document.addEventListener('keypress', function (keyboardEvent) {
      if (keyboardEvent.code in { KeyP: 112, Space: 32 } &&
          !keyboardEvent.shiftKey && !keyboardEvent.metaKey &&
          !keyboardEvent.altKey   && !keyboardEvent.ctrlKey)
        videoEl[videoEl.paused ? 'play' : 'pause']()
    })

    var instrEl = document.getElementById('keyboard-event-instructions')
    getNotificationWithPermissions(instrEl.innerText, (success) => {
      !success && instrEl.classList.remove('hide')
    })

    window.addEventListener('hashchange', updateTileMode)

    updateTileMode()
  })

})()
