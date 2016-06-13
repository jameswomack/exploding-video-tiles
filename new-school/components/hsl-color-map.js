import d3 from 'd3'

export function render (svgSel, hslArray) {
  const svg = d3.select(svgSel),
    width = 800,
    height = 400;

  svg.attr('width', width)
    .attr('height', height);

  // group lightness into buckets
  const lightnessHistogram = d3.nest()
    .key((d) => { return d.l; })
    .rollup((leaves) => {

          const swatches = {};
          leaves.forEach((l) => {
              const h = l.h,
              s = l.s,
              key = `${h},${s}%`;

              if (!swatches[key]){
                  swatches[key] = l.value;
              } else {
                  swatches[key] = swatches[key] + 1;
              }
          });

      return {
          total: leaves.length,
          values: swatches
      };

    })
    .entries(hslArray);

  const margin = {bottom: 30, left: 100, right: 100, top: 30},
  sWidth = width - margin.left - margin.right,
  sHeight = height- margin.bottom - margin.top,
  x = d3.scale.linear().domain([0, 360]).range([margin.left, sWidth]), //hue
  y = d3.scale.linear().domain([100, 0]).range([margin.top, sHeight]), //saturation & lightness
  barL = d3.scale.linear().range([0, margin.right]),
  barS = d3.scale.linear().range([margin.left, 0]),
  xAxis = d3.svg.axis().scale(x),
  yAxis = d3.svg.axis().scale(y).orient('left'),
  r = d3.scale.sqrt().range([1, 10]),
  maxLightness = { key: '', total: 0},
  maxSaturation = {key: '', total: 0};

  lightnessHistogram.forEach((d) => {
      if (d.values.total > maxLightness.total){
          maxLightness.total = d.values.total;
          maxLightness.key = d.key;
      }
  });

  barL.domain([0, maxLightness.total]);

  svg.selectAll('text.title')
    .remove();

  svg.append('text')
    .attr('class', 'title')
    .attr('x', margin.left)
    .attr('y', margin.top - 15)
    .text('Saturation')

  svg.append('text')
    .attr('class', 'title')
    .attr('x', margin.left + sWidth)
    .attr('y', margin.top - 15)
    .text('Lightness')

  redraw(maxLightness.key);


  function clickedBar (d) {
      redraw(d.key);
  }

  function redraw(currentKey) {
      const selectedValues = lightnessHistogram.filter((d) => {
          return d.key === currentKey;
      })[0].values.values;

      let maxCount = 0;

      for (const k in selectedValues){
          if (selectedValues[k] > maxCount){
              maxCount = selectedValues[k];
          }
      }

      r.domain([1, maxCount]);

      const filteredSaturation = Object.keys(selectedValues).map((d) => {
        return { key: d.split(',')[1], value: selectedValues[d]};
      });

      const selectedSaturation = d3.nest()
        .key((d) => { return d.key; })
        .rollup((values) => {
          return values.map((d) => {
            return d.value;
            })
            .reduce((prev, curr) => {
            return prev + curr;
          })
        })
        .entries(filteredSaturation);

      selectedSaturation.forEach((d) => {
          if (d.values > maxSaturation.total){
              maxSaturation.total = d.values;
              maxSaturation.key = d.key;
          }
      });

      barS.domain([maxSaturation.total, 0]);

      const barsS = svg.selectAll('rect.saturation')
          .data(selectedSaturation);

      barsS.enter()
          .append('rect')
          .attr('height', 6)
          .attr('class', 'saturation');

      barsS
          .attr('y', (d) => { return y(parseInt(d.key)); })
          .transition()
          .attr('x', (d) => { return margin.left - barS(d.values)})
          .attr('width', (d) => { return barS(d.values); })

      barsS.exit()
          .transition()
          .attr('width', 0)
          .remove();

      svg.selectAll('g.axis')
          .remove();

      /* eslint-disable prefer-reflect */
      svg.append('g')
          .attr('class', 'x axis')
          .attr('transform', `translate(0,${height - margin.top})`)
          .call(xAxis);

      svg.append('g')
          .attr('class', 'y axis')
          .attr('transform', `translate(${margin.left},0)`)
          .call(yAxis);

      svg.append('g')
          .attr('class', 'y-bar axis')
          .attr('transform', `translate(${margin.left + sWidth},0)`)
          .call(yAxis);
      /* eslint-enable prefer-reflect */

      const circles = svg.selectAll('circle')
         .data(Object.keys(selectedValues));

      circles.exit()
         .transition()
         .attr('r', 0)
         .remove();

      circles.enter()
         .append('circle');

      circles
         .attr('cx', (d) => { return x(parseInt(d.split(',')[0]))})
         .attr('cy', (d) => { return y(parseInt(d.split(',')[1]))})
         .attr('fill', (d) => { return `hsl(${d},${currentKey}%`})
         .transition()
         .attr('r', (d) => { return r(selectedValues[d])})

      const barsL = svg.selectAll('rect.lightness')
          .data(lightnessHistogram);

      barsL.enter()
          .append('rect')
          .attr('height', 6)

      barsL.attr('x', margin.left + sWidth)
          .attr('y', (d) => { return y(parseInt(d.key)); })
          .attr('class', (d) => {
              if (d.key === currentKey){
                  return 'highlight lightness';
              } else {
                  return 'lightness';
              }
          })
          .on('click', clickedBar)
          .transition()
          .attr('width', (d) => { return barL(d.values.total); })

      barsL.exit()
          .transition()
          .attr('width', 0)
          .remove();

  }

}
