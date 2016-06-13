import d3 from 'd3'

export function render (svgSel, hslArray) {
  const svg    = d3.select(svgSel),
        width  = 800,
        height = 100,
        margin = { left: 100, right: 100 }

  svg.attr('width', width)
    .attr('height', height)

    const colorHistogram = d3.nest()
        .key(d => { return d.group })
        .key(d => { return Math.round(d.h) })
        .rollup(leaves => { return leaves.length })
        .entries(hslArray)

  const x = d3.scale.linear().domain([0, 360]).range([margin.left, width - margin.left - margin.right]),
        y = d3.scale.linear().range([0, height])

  let max = 0

  colorHistogram.forEach(group =>
    max = Math.max(d3.max(group.values, d => d.values), max))

  y.domain([0, max])

  svg.selectAll('rect').remove()

  colorHistogram.forEach(({ values }) =>
    svg.selectAll('rect.test')
      .data(values)
      .enter()
      .append('rect')
      .attr('x', ({ key }) => x(key))
      .attr('y', d => height - y(d.values))
      .attr('height', d => y(d.values))
      .attr('width',  2)
      .attr('fill',   d => { return d3.hsl(d.key, .8, .5); }))
}
