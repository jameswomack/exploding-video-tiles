  function colorMap(svgSel, hslArray) {
    const svg = d3.select(svgSel),
      width = 800,
      height = 400;

    svg.attr('width', width)
      .attr('height', height);

    // group lightness into buckets
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

    var saturationHistogram = d3.nest()
      .key(function(d){ return Math.round(d.s);})
      .rollup(function(leaves){ return leaves.length; })
      .entries(hslArray);

    var margin = {bottom: 30, left: 100, right: 100, top: 30},
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

    lightnessHistogram.forEach(function(d){
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


    function clickedBar(d){
        redraw(d.key);
    }

    function redraw(currentKey){
        var selectedValues = lightnessHistogram.filter(function(d){
            return d.key === currentKey;
        })[0].values.values;

        var maxCount = 0;

        for (var k in selectedValues){
            if (selectedValues[k] > maxCount){
                maxCount = selectedValues[k];
            }
        }

        r.domain([1, maxCount]);

        var filteredSaturation = Object.keys(selectedValues).map(function(d){
          return { key: d.split(',')[1], value: selectedValues[d]};
        });

        var selectedSaturation = d3.nest()
          .key(function(d){ return d.key; })
          .rollup(function(values){
            return values.map(function(d){
              return d.value;
              })
              .reduce(function(prev, curr){
              return prev + curr;
            })
          })
          .entries(filteredSaturation);

        selectedSaturation.forEach(function(d){
            if (d.values > maxSaturation.total){
                maxSaturation.total = d.values;
                maxSaturation.key = d.key;
            }
        });

        barS.domain([maxSaturation.total, 0]);

        var barsS = svg.selectAll('rect.saturation')
            .data(selectedSaturation);

        barsS.enter()
            .append('rect')
            .attr('height', 3)
            .attr('class', 'saturation');

        barsS
            .attr('y', function(d){ return y(parseInt(d.key)); })
            .transition()
            .attr('x', function(d){ return margin.left - barS(d.values)})
            .attr('width', function(d){ return barS(d.values); })

        barsS.exit()
            .transition()
            .attr('width', 0)
            .remove();

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
           .data(Object.keys(selectedValues));

        circles.exit()
           .transition()
           .duration(500)
           .attr('r', 0)
           .remove();

        circles.enter()
           .append('circle');

        circles
           .attr('cx', function(d) { return x(parseInt(d.split(',')[0]))})
           .attr('cy', function(d) { return y(parseInt(d.split(',')[1]))})
           .attr('fill', function(d){ return 'hsl(' + d + ',' + currentKey +'%)'})
           .transition()
           .duration(500)
           .attr('r', function(d){ return r(selectedValues[d])})

        var barsL = svg.selectAll('rect:not(.saturation)')
            .data(lightnessHistogram);

        barsL.enter()
            .append('rect')
            .attr('height', 3)

        barsL.attr('x', margin.left + sWidth)
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
            .attr('width', function(d){ return barL(d.values.total); })

        barsL.exit()
            .transition()
            .attr('width', 0)
            .remove();

    }

  }
