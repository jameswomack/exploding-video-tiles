import Tile from './tile'

/*
  Subclassable built-ins
*/

class Tiles extends Array {
  push (tile) {
    if (!(tile instanceof Tile))
      throw new TypeError('Tiles accepts only instances of Tile')

    return super.push(tile)
  }

  sort () {
    return super.sort(zindexSort)
  }

  reposition (canvasX, canvasY) {
    return this.forEach(getTilePositioningFn(canvasX, canvasY))
  }

  drawEach () {
    return this.forEach(tile => tile.draw())
  }
}

function zindexSort (a, b) {
  return a.force - b.force
}


function getTilePositioningFn (x, y) {
  return function (tile) {
    const xdiff = tile.currentX - x
    const ydiff = tile.currentY - y
    const dist  = Math.sqrt(xdiff * xdiff + ydiff * ydiff)

    const randRange = 220 + Math.random() * 30
    const range = randRange - dist
    const force = 3 * (range / randRange)

    if (force > tile.force) {
      tile.force = force
      const radians = Math.atan2(ydiff, xdiff)
      tile.moveX = Math.cos(radians)
      tile.moveY = Math.sin(radians)
      tile.moveRotation = 0.5 - Math.random()
    }
  }
}

export default Tiles
