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
    })

    var colorGroups = d3.nest()
        .key(function(d){ return d.group; })
        .entries(hslArray)

  }