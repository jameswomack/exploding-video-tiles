import createDraw from '../../components/canvas-draw'
import Metrics    from './metrics'
import Tile       from './tile'
import Tiles      from './tiles'

export default class CanvasVideoFrameProcessor {
  constructor ({
    videoEl,
    outputEl,
    copyCanvasEl,
    shouldStart = false
  }) {
    this.Metrics      = Metrics // needs to be first
    this.copyCanvasEl = copyCanvasEl // needs to be 2nd

    this.Draw = createDraw({ stage : this })

    this.frameCache          = { }
    this.tick                = null
    this.currentTileModeName = 'rectangles'
    this.FRAME_RATE          = 23.96
    this.frameChache         = { }
    this.tiles               = new Tiles()
    this.PAINTRECT           = {
      x: 0, y: 0, width: 0, height: 0
    }
    this.drawCtx = outputEl.getContext('2d')
    this.videoEl = videoEl
    this.copyCtx = copyCanvasEl.getContext('2d', {
      alpha : false
    })
    this.sourceRect = {
      x: 0, y: 0, width: 0, height: 0
    }
    this.videoHeight = 0
    this.videoWidth  = 0
    this.videoRatio  = 0

    this.PAINTRECT.width  = outputEl.clientWidth
    this.PAINTRECT.height = outputEl.clientHeight

    this.dropBomb                   = this.dropBomb.bind(this)
    this.processFrame               = this.processFrame.bind(this)
    this.updateProcessFrameInterval = this.updateProcessFrameInterval.bind(this)
    this.updateTileMode             = this.updateTileMode.bind(this)
    this.updateTileModeAttribute    = this.updateTileModeAttribute.bind(this)

    outputEl.addEventListener('mousedown', this.dropBomb)
    outputEl.addEventListener('touchend' , this.dropBomb)

    if (shouldStart) {
      this.updateTileMode()
      this.updateProcessFrameInterval()
    }

    window.addEventListener('hashchange', this.updateTileMode)
  }

  getCurrentFrame () {
    const frameCache = this.frameCache
    const videoEl    = this.videoEl
    const key        = videoEl.currentTime.toFixed(5)
    const FRAME_RATE = this.FRAME_RATE
    frameCache[key] || (frameCache[key] = Math.floor(videoEl.currentTime.toFixed(5) * FRAME_RATE))
    return frameCache[key]
  }


  dropBomb (e = window.event) {
    const el = e.currentTarget

    const coords = this.pageCoordinatesFromEvent(e)

    this.explode(coords.pageX - el.offsetLeft, coords.pageY - el.offsetTop)
  }

  explode (canvasX, canvasY) {
    this.tiles.reposition(canvasX, canvasY)
    this.tiles.sort()
    this.processFrame()
  }

  processFrame () {
    const videoEl = this.videoEl

    if (!Number.isNaN(videoEl.duration)) {
      this.videoHeight = videoEl.videoHeight
      this.videoWidth  = videoEl.videoWidth
      this.videoRatio  = this.videoWidth/this.videoHeight

      if (this.sourceRect.width === 0) {
        this.sourceRect = {
          x: 0, y: 0, width: this.videoWidth, height: this.videoHeight
        }
        this.createTiles()
      }
    }

    this.copyImage()

    this.tiles.drawEach()
  }

  createTiles () {
    const offset = {
      x : Math.floor(Metrics.currentTileMode.TILE_CENTER_WIDTH + (this.PAINTRECT.width - this.sourceRect.width) / 2),
      y : Math.floor(Metrics.currentTileMode.TILE_CENTER_HEIGHT + (this.PAINTRECT.height - this.sourceRect.height) / 2)
    }
    let y = 0

    while (y < this.sourceRect.height) {
      let x = 0

      while (x < this.sourceRect.width) {
        this.tiles.push(new Tile({
          stage : this,
          video : {
            x, y
          },
          // Part of the new `Object` static methods
          offset : Object.assign({ }, offset)
        }))

        x += Metrics.currentTileMode.TILE_WIDTH
      }

      y += Metrics.currentTileMode.TILE_HEIGHT
    }
  }

  copyImage () {
    const { PAINTRECT, videoEl } = this
    this.copyCtx.drawImage(videoEl, 0, 0) // expensive
    this.drawCtx.clearRect(PAINTRECT.x, PAINTRECT.y, PAINTRECT.width, PAINTRECT.height)
  }

  updateTileModeAttribute (name, value) {
    this.Metrics.currentTileMode[name] = Number(value)
    name === 'FRAME_PROCESSING_INTERVAL' && this.updateProcessFrameInterval()
    name === 'NAME' && (location.hash = `#${value}`)
  }

  updateTileMode () {
    const currentTileModeNameFromLocation = location.hash.replace('#', '')
    this.currentTileModeName = currentTileModeNameFromLocation || this.currentTileModeName

    const tileModeUnInitialized = !Metrics.currentTileMode
    const tileModeOutOfSync = tileModeUnInitialized ? true : Metrics.currentTileMode.NAME !== this.currentTileModeName

    if (tileModeUnInitialized || tileModeOutOfSync) {
      Metrics.currentTileMode = Object.assign({ }, Metrics[this.currentTileModeName])
      Object.keys(Metrics.currentTileMode).forEach(k => {
        // TODO: Template string
        document.querySelector(`input[name="${k}"]`).value = Metrics[this.currentTileModeName][k]
      })
    }
  }

  updateProcessFrameInterval () {
    this.tick && clearInterval(this.tick)
    this.tick = setInterval(this.processFrame, Metrics.currentTileMode.FRAME_PROCESSING_INTERVAL)
  }

  // Quasi-polyfill for `e.pageX || e.pageY`
  pageCoordinatesFromEvent (e) {
    if (e.pageX || e.pageY)
      return e

    let pageX = 0
    let pageY = 0

    if (e.clientX || e.clientY) {
      pageX = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft
      pageY = e.clientY + document.body.scrollTop  + document.documentElement.scrollTop
    }

    return { pageX, pageY }
  }

}
