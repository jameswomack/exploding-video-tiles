  function hslToColor(hslArray) {
    //converts hue to color groups
    hslArray = hslArray.map(function(d){
        var hue = d.h;

        if (hue < 23){
            d.group = "red";
        } else if (hue < 42){
            d.group = "orange";
        } else if (hue < 70){
            d.group = "yellow";
        } else if (hue < 164){
            d.group = "green";
        } else if (hue < 203){
            d.group = "cyan";
        } else if (hue < 262){
            d.group = "blue";
        } else if (hue < 299){
            d.group = "purple";
        } else if (hue < 337){
            d.group = "magenta";
        } else {
            d.group = "red";
        }

        return d;
    });

    return hslArray;
  }

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

  function circlePack(selectionID, data) {
    d3.select(selectionID)
      .attr("height", 2400)
      .attr("width", 1200)
      .style("background", "white");

    console.log(data);

    var hScale = function(d) {return Math.round(d / 15)};

    var oScale = function(d) {return Math.round(d / 10)};

    var lScale = function(d) {return Math.round(d / 20)};

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
      var hashString = datapoint.group + "-" + datapoint.rh +"-" + datapoint.rs +"-" +datapoint.rl;
      datapoint.key = hashString;

      if (dataHash[hashString]) {
        dataHash[hashString].value = dataHash[hashString].value + 1;
      }
      else {
        dataHash[hashString] = datapoint;
        newData.push(datapoint);
      }
    });

    var nestedData = d3.nest()
      .key(d => d.group)
//      .key(d => "all")
      .key(d => d.rl)
//      .key(d => d.rs)
//      .key(d => d.rh)
      .entries(newData);

      console.log("nestedData", nestedData)

      var packedData = [];


      var max = d3.max(nestedData.map(d => d3.sum(d.values.map(p => d3.sum(p.values.map(q => q.value))))))

      nestedData.forEach(d => {
        var total = d3.sum(d.values.map(p => d3.sum(p.values.map(q => q.value))))
        var packSize = total / max * 400;
        packSize = 400

      packChart = d3.layout.pack();
      packChart.size([packSize,packSize])
        .children(function(d) {return d.values})
        .value(function(d) {return d.value});

        var thisPackedColor = packChart(d);
        packedData.push(thisPackedColor);
      })

      packedData.forEach((packedColor, packedIndex) => {

        packedColor = packedColor.filter(d => d.depth === 2)

        d3.select(selectionID)
        .selectAll("g." + nestedData[packedIndex].key)
        .data([0])
        .enter()
        .append("g")
        .attr("class", nestedData[packedIndex].key)
        .attr("transform", "translate(" + ((packedIndex%3 * 400)) + "," + ((Math.floor(packedIndex/3) * 400) + 1200) + ")")
        .append("text")
        .attr("y", 20)
        .attr("x", 200)
        .text(nestedData[packedIndex].key)

        var packG = d3.select(selectionID).select("g." + nestedData[packedIndex].key);

        packG
        .selectAll("circle")
  //      .data(noLeaf, d => d.key + "-" + d.parent.key + "-" + d.parent.parent.key)
        .data(packedColor, d => d.key)
        .enter()
        .append("circle")
        .attr("r", 1)
        .attr("cx", function(d) {return d.x})
        .attr("cy", function(d) {return d.y})
  //      .style("fill", fillCircle)
        .style("fill", fillCircle2Level)
        .style("stroke", "black")

        packG
        .selectAll("circle")
        .transition()
        .duration(1000)
        .attr("r", function(d) {return d.r})
        .attr("cx", function(d) {return d.x})
        .attr("cy", function(d) {return d.y})
  //      .style("fill", fillCircle)
        .style("fill", fillCircle2Level)
  /*      .transition()
        .delay(1000)
        .duration(2000)
        .attr("cx", function (d,i) {return i%30 * 30})
        .attr("cy", function (d,i) {return Math.floor(i/30) * 30})

        grid by size
        grid by color

        */

        packG
        .selectAll("circle")
  //        .data(noLeaf, d => d.key + "-" + d.parent.key + "-" + d.parent.parent.key)
          .data(packedColor, d => d.key)
          .exit()
          .transition()
          .duration(1000)
          .attr("r", 0)
          .remove();

      })

  //Do it again for the regular chart

      packChart = d3.layout.pack();
      packChart.size([1200,1200])
        .children(function(d) {return d.values})
        .value(function(d) {return d.value});

      var circleData = packChart({key: "root", values: nestedData}).filter(d => d.depth === 3);

      console.log("circleData", circleData)

      d3.select(selectionID)
      .selectAll("g.overall")
      .data([0])
      .enter()
      .append("g")
      .attr("class", "overall");

      packG = d3.select(selectionID).select("g.overall");

      packG
      .selectAll("circle")
//      .data(noLeaf, d => d.key + "-" + d.parent.key + "-" + d.parent.parent.key)
      .data(circleData, d => d.key)
      .enter()
      .append("circle")
      .attr("r", 1)
      .attr("cx", function(d) {return d.x})
      .attr("cy", function(d) {return d.y})
//      .style("fill", fillCircle)
      .style("fill", fillCircle2Level)
      .style("stroke", "black")

      packG
      .selectAll("circle")
      .transition()
      .duration(1000)
      .attr("r", function(d) {return d.r})
      .attr("cx", function(d) {return d.x})
      .attr("cy", function(d) {return d.y})
//      .style("fill", fillCircle)
      .style("fill", fillCircle2Level)
/*      .transition()
      .delay(1000)
      .duration(2000)
      .attr("cx", function (d,i) {return i%30 * 30})
      .attr("cy", function (d,i) {return Math.floor(i/30) * 30})

      grid by size
      grid by color

      */

      packG
      .selectAll("circle")
//        .data(noLeaf, d => d.key + "-" + d.parent.key + "-" + d.parent.parent.key)
        .data(circleData, d => d.key)
        .exit()
        .transition()
        .duration(1000)
        .attr("r", 0)
        .remove();


      function fillCircle(d) {

        if (d.depth === 4) {
          return d3.hsl(d.key * 15, d.parent.key / 10, d.parent.parent.key / 10).toString()
        }

        return "none"
      }

      function fillCircle2Level(d) {
          return d3.hsl(d.rh * 15, (d.rs + 1) / 10, (d.rl) / 5).toString()
      }
  }
