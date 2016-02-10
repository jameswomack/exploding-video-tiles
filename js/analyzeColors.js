function hueBar(svgSel, hslArray) {
  const svg = d3.select(svgSel),
    width = 600,
    height = 200;

  svg.attr('width', width)
    .attr('height', height);

    var colorHistogram = d3.nest()
        .key(function(d){ return d.group; })
        .key(function(d){ return Math.round(d.h); })
        .rollup(function(leaves){ return leaves.length; })
        .entries(hslArray);

  var x = d3.scale.linear().domain([0, 360]).range([30, width - 30]),
  y = d3.scale.linear().range([30, height -30]),
  max = 0;

  colorHistogram.forEach(function(group){
      var groupMax = d3.max(group.values, function(d){
        return d.values;
      })

      if (groupMax > max){
        max = groupMax;
      }
  })

  y.domain([0, max]);

  svg.selectAll('rect')
    .remove()

  colorHistogram.forEach(function(group){
      svg.selectAll('rect.test')
        .data(group.values)
        .enter()
        .append('rect')
        .attr('x', function(d) { return x(d.key)})
        .attr('y', function(d) { return height - y(d.values)})
        .attr('height', function(d) {
            return y(d.values)})
        .attr('width', 2)
        .attr('fill', function(d){ return 'hsl(' + d.key +', 80%, 50%)'})

  })
}

function hueLightScatter(svgSel, hslArray) {
  const svg = d3.select(svgSel),
    width = 800,
    height = 600;

  svg.attr('width', width)
    .attr('height', height);

  var x = d3.scale.linear().domain([0, 360]).range([30, width - 30]),
  y = d3.scale.linear().domain([0, 100]).range([30, height -30]);

  svg.selectAll('circle')
      .data(hslArray)
      .enter()
      .append('circle')
      .attr('r', 1)
      .attr('cx', function(d) { return x(d.h)})
      .attr('cy', function(d) { return y(d.l)})
      .attr('fill', function(d){ return 'hsl(' + d.h +',' + d.s + '%,' + d.l +'%)'})


}

function colorMap(svgSel, hslArray) {
  const svg = d3.select(svgSel),
    width = 800,
    height = 400;

  svg.attr('width', width)
    .attr('height', height);

  // group lightness into buckets
  console.log('about to re create lightness histogram')
  var lightnessHistogram = d3.nest()
    .key(function(d){ return Math.round(d.l); })
    .rollup(function(leaves){

          var swatches = {};
          leaves.forEach(function(l){
              var h = Math.round(l.h),
              s = Math.round(l.s),
              key = h + ',' + s + '%';

              if (!swatches[key]){
                  swatches[key] = 1;
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

  var margin = {bottom: 30, left: 30, right: 100, top: 30},
  sWidth = width - margin.left - margin.right,
  sHeight = height- margin.bottom - margin.top,
  x = d3.scale.linear().domain([0, 360]).range([margin.left, sWidth]), //hue
  y = d3.scale.linear().domain([100, 0]).range([margin.top, sHeight]), //saturation & lightness
  barW = d3.scale.linear().range([0, margin.right]),
  xAxis = d3.svg.axis().scale(x),
  yAxis = d3.svg.axis().scale(y).orient('left'),
  r = d3.scale.sqrt().range([1, 10]),
  maxLightness = { key: '', total: 0};


  lightnessHistogram.forEach(function(d){
      if (d.values.total > maxLightness.total){
          maxLightness.total = d.values.total;
          maxLightness.key = d.key;
      }
  });

  barW.domain([0, maxLightness.total]);

  redraw(maxLightness.key);

  function clickedBar(d){
      redraw(d.key);
  }

  function redraw(currentKey){
      var maxValues = lightnessHistogram.filter(function(d){
          return d.key === currentKey;
      })[0].values.values;

      var maxCount = 0;

      for (var k in maxValues){
          if (maxValues[k] > maxCount){
              maxCount = maxValues[k];
          }
      }

      r.domain([1, maxCount]);


      svg.selectAll('g.axis')
          .remove();

      svg.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + (height - margin.top) + ")")
          .call(xAxis);

      svg.append("g")
          .attr("class", "y axis")
          .attr("transform", "translate(" + margin.left + ",0)")
          .call(yAxis);

      svg.append("g")
          .attr("class", "y-bar axis")
          .attr("transform", "translate(" + (margin.left + sWidth) + ",0)")
          .call(yAxis);

      var circles = svg.selectAll('circle')
         .data(Object.keys(maxValues));

      circles.exit()
         .transition()
         .duration(100)
         .attr('r', 0)
         .remove();

      circles.enter()
         .append('circle');

      circles
         .attr('cx', function(d) { return x(parseInt(d.split(',')[0]))})
         .attr('cy', function(d) { return y(parseInt(d.split(',')[1]))})
         .attr('fill', function(d){ return 'hsl(' + d + ',' + currentKey +'%)'})
         .transition()
         .duration(10)
         .attr('r', function(d){ return r(maxValues[d])})

      var bars = svg.selectAll('rect')
          .data(lightnessHistogram);

      bars.enter()
          .append('rect')
          .attr('height', 3);

      bars.attr('x', margin.left + sWidth)
          .attr('y', function(d){ return y(parseInt(d.key)); })
          .attr('class', function(d){
              if (d.key === currentKey){
                  return 'highlight';
              } else {
                  return '';
              }
          })
          .on('click', clickedBar)
          .transition()
          .attr('width', function(d){ return barW(d.values.total); })


      bars.exit()
          .transition()
          .attr('width', 0)
          .remove();

  }



}
