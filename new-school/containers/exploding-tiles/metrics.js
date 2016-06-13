const Metrics = { currentTileMode : { } }

Metrics.rectangles = {
  NAME                      : 'rectangles',
  TILE_WIDTH                : 30,
  TILE_HEIGHT               : 18,
  FRAME_PROCESSING_INTERVAL : 1000 / 60,
  TILE_CENTER_WIDTH         : 16,
  TILE_CENTER_HEIGHT        : 12
}

Metrics.ellipses = {
  ...Metrics.rectangles,
  NAME : 'ellipses'
}

Metrics.pointillism = {
  ...Metrics.rectangles,
  NAME                      : 'pointillism',
  FRAME_PROCESSING_INTERVAL : 1000 / 20
}

export default Metrics
