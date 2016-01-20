  function analyzeColors(hslArray) {

    const svg = d3.select('#color-analysis svg'),
      width = 800,
      height = 600;

    svg.attr('width', width)
      .attr('height', height);


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
    })

    //create map of colors
    // var colorGroups = d3.nest()
    //     .key(function(d){ return d.group; })
    //     .entries(hslArray);

    // var x = d3.scale.linear().domain([0, 360]).range([30, width - 30]),
    // y = d3.scale.linear().domain([0, 100]).range([30, height -30]);

    // svg.selectAll('circle')
    //     .data(hslArray)
    //     .enter()
    //     .append('circle')
    //     .attr('r', 1)
    //     .attr('cx', function(d) { return x(d.h)})
    //     .attr('cy', function(d) { return y(d.l)})
    //     .attr('fill', function(d){ return 'hsl(' + d.h +',' + d.s + '%,' + d.l +'%)'})


    //create histogram of colors
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