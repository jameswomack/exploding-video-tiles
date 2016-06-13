import d3 from 'd3'


export function translateGroup (selectionID, {
  translateX  = 0,
  translateY  = 0,
  data        = [ 0 ],
  className   = 'overall'
} = { }) {
  return d3.select(selectionID)
  .selectAll(`g.${className}`)
  .data(data)
  .enter()
  .append('g')
  .attr('class', className)
  .attr('transform', `translate(${translateX},${translateY})`)
}

export function translateGroupWithStroke (selectionID, {
  translateX  = 0,
  translateY  = 0,
  x1          = 0,
  x2          = 800,
  y1          = 800,
  y2          = 800,
  data        = [ 0 ],
  className   = 'overall',
  selector    = `.${className}`,
  stroke      = 'gray',
  strokeWidth = '1px'
} = { }) {
  return translateGroup(selectionID, {
    selector, data, translateX, translateY
  })
  .append('line')
  .style('stroke', stroke)
  .style('stroke-width', strokeWidth)
  .attr('x1', x1)
  .attr('x2', x2)
  .attr('y1', y1)
  .attr('y2', y2)
}

export function circlePack (data) {
  const dataHash = {}
  const newData  = []

  data.forEach(d => {
    const datapoint = {}
    datapoint.rh = hScale(d.h) // hue
    datapoint.rs = oScale(d.s) // saturation
    datapoint.rl = lScale(d.l) // lightness

    if (Object.is(datapoint.rl, 0)) {
      datapoint.rh = 0
      datapoint.rs = 0
      datapoint.rl = 0
    }

    if (Object.is(datapoint.rl, 5)) {
      datapoint.rh = 0
      datapoint.rs = 0
      datapoint.rl = 5
    }

    datapoint.group  = d.group
    datapoint.value  = 1

    const hashString = `${datapoint.group}-${datapoint.rh}-${datapoint.rs}-${datapoint.rl}`
    datapoint.key    = hashString

    if (dataHash[hashString]) {
      dataHash[hashString].value = dataHash[hashString].value + 1
    } else {
      dataHash[hashString] = datapoint
      newData.push(datapoint)
    }
  })

  return newData
}

export function getNest (data) {
  return d3.nest()
    .key(d => d.group)
    .key(d => d.rl)
    .entries(circlePack(data))
}


export function setElementSize (selectionID, width, height) {
  return d3.select(selectionID)
    .attr('height', height)
    .attr('width', width)
}

export function createCircles (circlePackGroup, packedColor) {
  return circlePackGroup
    .selectAll('circle')
    .data(packedColor, d => d.key)
    .enter()
    .append('circle')
    .attr('r', 1)
    .attr('cx', d => d.x)
    .attr('cy', d => d.y)
    .style('fill', fillCircle2Level)
    .style('stroke', d => d.rl === 0 ? 'white' : '')
}

export function animateCirclePackGroupPosition (circlePackGroup) {
  return circlePackGroup
    .selectAll('circle')
    .transition()
    .duration(1000)
    .attr('r', d => d.r)
    .attr('cx', d => d.x)
    .attr('cy', d => d.y)
    .style('fill', fillCircle2Level)
}

export function rotateAndColorize (circlePackGroup, packedColor) {
  return circlePackGroup
    .selectAll('circle')
    .data(packedColor, d => d.key)
    .exit()
    .transition()
    .duration(1000)
    .attr('r', 0)
    .remove()
}

export function fillCircle2Level (d) {
  return d3.hsl(d.rh * 15, (d.rs + 1) / 10, d.rl / 5).toString()
}

export function render (selectionID, data) {
  setElementSize(selectionID, 1200, 800)

  const packChart = d3.layout.pack()
  packChart.size([ 800, 800 ])
    .children(d => d.values)
    .value(d => d.value)

  const circleData = packChart({
    key    : 'root',
    values : getNest(data)
  }).filter(d => d.depth === 3)

  translateGroupWithStroke(selectionID, {
    translateX : 200,
    translateY : 0
  })

  const packG = d3.select(selectionID).select('g.overall')

  createCircles(packG, circleData)
  animateCirclePackGroupPosition(packG)
  rotateAndColorize(packG, circleData)
}


function scale  (d, by) {
  return Math.round(d / by)
}

function hScale (d)     {
  return scale(d, 15)
}

function oScale (d)     {
  return scale(d, 10)
}

function lScale (d)     {
  return scale(d, 20)
}
