window.colorMap = function colorMap (svgSel, hslArray) {
    const svg = d3.select(svgSel),
      width = 800,
      height = 400;

    svg.attr('width', width)
      .attr('height', height);

    // group lightness into buckets
    var lightnessHistogram = d3.nest()
      .key(function (d) { return d.l; })
      .rollup(function (leaves) {

            var swatches = {};
            leaves.forEach(function (l) {
                var h = l.h,
                s = l.s,
                key = h + ',' + s + '%';

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

    lightnessHistogram.forEach(function (d) {
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
        var selectedValues = lightnessHistogram.filter(function (d) {
            return d.key === currentKey;
        })[0].values.values;

        var maxCount = 0;

        for (var k in selectedValues){
            if (selectedValues[k] > maxCount){
                maxCount = selectedValues[k];
            }
        }

        r.domain([1, maxCount]);

        var filteredSaturation = Object.keys(selectedValues).map(function (d) {
          return { key: d.split(',')[1], value: selectedValues[d]};
        });

        var selectedSaturation = d3.nest()
          .key(function (d) { return d.key; })
          .rollup(function (values) {
            return values.map(function (d) {
              return d.value;
              })
              .reduce(function (prev, curr) {
              return prev + curr;
            })
          })
          .entries(filteredSaturation);

        selectedSaturation.forEach(function (d) {
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
            .attr('height', 6)
            .attr('class', 'saturation');

        barsS
            .attr('y', function (d) { return y(parseInt(d.key)); })
            .transition()
            .attr('x', function (d) { return margin.left - barS(d.values)})
            .attr('width', function (d) { return barS(d.values); })

        barsS.exit()
            .transition()
            .attr('width', 0)
            .remove();

        svg.selectAll('g.axis')
            .remove();

        // eslint-disable-next-line
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + (height - margin.top) + ")")
            .call(xAxis);

        // eslint-disable-next-line
        svg.append("g")
            .attr("class", "y axis")
            .attr("transform", "translate(" + margin.left + ",0)")
            .call(yAxis);

        // eslint-disable-next-line
        svg.append("g")
            .attr("class", "y-bar axis")
            .attr("transform", "translate(" + (margin.left + sWidth) + ",0)")
            .call(yAxis);

        var circles = svg.selectAll('circle')
           .data(Object.keys(selectedValues));

        circles.exit()
           .transition()
           .attr('r', 0)
           .remove();

        circles.enter()
           .append('circle');

        circles
           .attr('cx', function (d) { return x(parseInt(d.split(',')[0]))})
           .attr('cy', function (d) { return y(parseInt(d.split(',')[1]))})
           .attr('fill', function (d) { return 'hsl(' + d + ',' + currentKey +'%'})
           .transition()
           .attr('r', function (d) { return r(selectedValues[d])})

        var barsL = svg.selectAll('rect.lightness')
            .data(lightnessHistogram);

        barsL.enter()
            .append('rect')
            .attr('height', 6)

        barsL.attr('x', margin.left + sWidth)
            .attr('y', function (d) { return y(parseInt(d.key)); })
            .attr('class', function (d) {
                if (d.key === currentKey){
                    return 'highlight lightness';
                } else {
                    return 'lightness';
                }
            })
            .on('click', clickedBar)
            .transition()
            .attr('width', function (d) { return barL(d.values.total); })

        barsL.exit()
            .transition()
            .attr('width', 0)
            .remove();

    }

  }

  window.singleCirclePack = function singleCirclePack (selectionID, data) {
    d3.select(selectionID)
      .attr("height", 800)
      .attr("width", 1200)

    var hScale = function (d) {return Math.round(d / 15)};

    var oScale = function (d) {return Math.round(d / 10)};

    var lScale = function (d) {return Math.round(d / 20)};

    var dataHash = {};
    var newData = []

    data = data.forEach(d => {
      var datapoint = {};
      datapoint.rh = hScale(d.h)
      datapoint.rs = oScale(d.s)
      datapoint.rl = lScale(d.l)

      if (datapoint.rl === 0) {
        datapoint.rh = 0;
        datapoint.rs = 0;
        datapoint.rl = 0;
      }


      if (datapoint.rl === 5) {
        datapoint.rh = 0;
        datapoint.rs = 0;
        datapoint.rl = 5;
      }

      datapoint.group = d.group;
      datapoint.value = 1;
      var hashString = datapoint.group + "-" + datapoint.rh + "-" + datapoint.rs + "-" + datapoint.rl;
      datapoint.key = hashString;

      if (dataHash[hashString]) {
        dataHash[hashString].value = dataHash[hashString].value + 1;
      } else {
        dataHash[hashString] = datapoint;
        newData.push(datapoint);
      }
    });

    var nestedData = d3.nest()
      .key(d => d.group)
      .key(d => d.rl)
      .entries(newData);

      var packedData = [];


      var max = d3.max(nestedData.map(d => d3.sum(d.values.map(p => d3.sum(p.values.map(q => q.value))))))
      var colorAuthority = ["red","orange","yellow","green","cyan","blue","purple","red"]

      colorAuthority.forEach(authColor => {
        var d = nestedData.filter(p => p.key === authColor)[0];

        if (d) {
          var total = d3.sum(d.values.map(p => d3.sum(p.values.map(q => q.value))))
          var packSize = total / max * 300;
          packSize = 300

          var packChart = d3.layout.pack();
          packChart.size([packSize,packSize])
            .children(function (dd) {return dd.values})
            .value(function (dd) {return dd.value});

          var thisPackedColor = packChart(d);
          packedData.push(thisPackedColor);
        } else {
          packedData.push([]);
        }
      })


      //Do it again for the regular chart

      var packChart = d3.layout.pack();
      packChart.size([800,800])
        .children(function (d) {return d.values})
        .value(function (d) {return d.value});

      var circleData = packChart({key: "root", values: nestedData}).filter(d => d.depth === 3);

      d3.select(selectionID)
      .selectAll("g.overall")
      .data([0])
      .enter()
      .append("g")
      .attr("class", "overall")
      .attr('transform', 'translate(200,0)')
      .append("line")
      .style("stroke", "gray")
      .style("stroke-width", "1px")
      .attr("x1", 0)
      .attr("x2", 800)
      .attr("y1", 800)
      .attr("y2", 800);

      var packG = d3.select(selectionID).select("g.overall");

      packG
      .selectAll("circle")
      .data(circleData, d => d.key)
      .enter()
      .append("circle")
      .attr("r", 1)
      .attr("cx", function (d) {return d.x})
      .attr("cy", function (d) {return d.y})
      .style("fill", fillCircle2Level)
      .style("stroke", function (d) {
          if (d.rl == 0) { // eslint-disable-line
            return 'white';
          }

          return '';
        })

      packG
      .selectAll("circle")
      .transition()
      .duration(1000)
      .attr("r", function (d) {return d.r})
      .attr("cx", function (d) {return d.x})
      .attr("cy", function (d) {return d.y})
      .style("fill", fillCircle2Level)

      packG
      .selectAll("circle")
        .data(circleData, d => d.key)
        .exit()
        .transition()
        .duration(1000)
        .attr("r", 0)
        .remove();


      function fillCircle (d) { // eslint-disable-line

        if (d.depth === 4) {
          return d3.hsl(d.key * 15, d.parent.key / 10, d.parent.parent.key / 10).toString()
        }

        return "none"
      }

      function fillCircle2Level (d) {
          return d3.hsl(d.rh * 15, (d.rs + 1) / 10, d.rl / 5).toString()
      }
  }

  window.bothCirclePacks = function bothCirclePacks(selectionID, data) {
    d3.select(selectionID)
      .attr("height", 1440)
      .attr("width", 900)

    var hScale = function (d) {return Math.round(d / 15)};

    var oScale = function (d) {return Math.round(d / 10)};

    var lScale = function (d) {return Math.round(d / 20)};

    var dataHash = {};
    var newData = []

    data = data.forEach(d => {
      var datapoint = {};
      datapoint.rh = hScale(d.h)
      datapoint.rs = oScale(d.s)
      datapoint.rl = lScale(d.l)

      if (datapoint.rl === 0) {
        datapoint.rh = 0;
        datapoint.rs = 0;
        datapoint.rl = 0;
      }


      if (datapoint.rl === 5) {
        datapoint.rh = 0;
        datapoint.rs = 0;
        datapoint.rl = 5;
      }

      datapoint.group = d.group;
      datapoint.value = 1;
      var hashString = datapoint.group + "-" + datapoint.rh + "-" + datapoint.rs + "-" + datapoint.rl;
      datapoint.key = hashString;

      if (dataHash[hashString]) {
        dataHash[hashString].value = dataHash[hashString].value + 1;
      } else {
        dataHash[hashString] = datapoint;
        newData.push(datapoint);
      }
    });

    var nestedData = d3.nest()
      .key(d => d.group)
      .key(d => d.rl)
      .entries(newData);

      var packedData = [];

      var colorAuthority = ["red","orange","yellow","purple","blue","green","red"]

      colorAuthority.forEach(authColor => {
        var d = nestedData.filter(p => p.key === authColor)[0];

        if (d) {
          var packSize = 300

          var packChart = d3.layout.pack();
          packChart.size([packSize,packSize])
            .children(function (dd) {return dd.values})
            .value(function (dd) {return dd.value});

          var thisPackedColor = packChart(d);
          packedData.push(thisPackedColor);
        } else {
          packedData.push([]);
        }
      })

      packedData.forEach((packedColor, packedIndex) => {

        packedColor = packedColor.filter(d => d.depth === 2)

        d3.select(selectionID)
        .selectAll("g." + colorAuthority[packedIndex])
        .data([0])
        .enter()
        .append("g")
        .attr("class", colorAuthority[packedIndex])
        .attr("transform", "translate(" + packedIndex%3 * 300 + "," + (Math.floor(packedIndex/3) * 300 + 830) + ")")
        .append("text")
        .attr("y", 20)
        .attr("x", 200)
        .style("font-size", "20px")
        .style("text-anchor", "middle")
        .text(colorAuthority[packedIndex])

        var packG = d3.select(selectionID).select("g." + colorAuthority[packedIndex]);

        packG
        .selectAll("circle")
        .data(packedColor, d => d.key)
        .enter()
        .append("circle")
        .attr("r", 1)
        .attr("cx", function (d) {return d.x})
        .attr("cy", function (d) {return d.y})
        .style("fill", fillCircle2Level)
        .style("stroke", function (d) {
          if (d.rl == 0) { // eslint-disable-line
            return 'white';
          }

          return '';
        })

        packG
        .selectAll("circle")
        .transition()
        .duration(1000)
        .attr("r", function (d) {return d.r})
        .attr("cx", function (d) {return d.x})
        .attr("cy", function (d) {return d.y})
        .style("fill", fillCircle2Level)

        packG
        .selectAll("circle")
          .data(packedColor, d => d.key)
          .exit()
          .transition()
          .duration(1000)
          .attr("r", 0)
          .remove();

      })

      //Do it again for the regular chart

      var packChart = d3.layout.pack();
      packChart.size([800,800])
        .children(function (d) {return d.values})
        .value(function (d) {return d.value});

      var circleData = packChart({key: "root", values: nestedData}).filter(d => d.depth === 3);

      d3.select(selectionID)
      .selectAll("g.overall")
      .data([0])
      .enter()
      .append("g")
      .attr("class", "overall")
      .attr('transform', 'translate(50,0)')
      .append("line")
      .style("stroke", "gray")
      .style("stroke-width", "1px")
      .attr("x1", 0)
      .attr("x2", 800)
      .attr("y1", 800)
      .attr("y2", 800);

      var packG = d3.select(selectionID).select("g.overall");

      packG
      .selectAll("circle")
      .data(circleData, d => d.key)
      .enter()
      .append("circle")
      .attr("r", 1)
      .attr("cx", function (d) {return d.x})
      .attr("cy", function (d) {return d.y})
      .style("fill", fillCircle2Level)
      .style("stroke", function (d) {
          if (d.rl == 0) { // eslint-disable-line
            return 'white';
          }

          return '';
        })

      packG
      .selectAll("circle")
      .transition()
      .duration(1000)
      .attr("r", function (d) {return d.r})
      .attr("cx", function (d) {return d.x})
      .attr("cy", function (d) {return d.y})
      .style("fill", fillCircle2Level)

      packG
      .selectAll("circle")
        .data(circleData, d => d.key)
        .exit()
        .transition()
        .duration(1000)
        .attr("r", 0)
        .remove();


      function fillCircle (d) { // eslint-disable-line

        if (d.depth === 4) {
          return d3.hsl(d.key * 15, d.parent.key / 10, d.parent.parent.key / 10).toString()
        }

        return "none"
      }

      function fillCircle2Level(d) {
          return d3.hsl(d.rh * 15, (d.rs + 1) / 10, d.rl / 5).toString()
      }
  }