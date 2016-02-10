self.addEventListener('message', function(e) {
  var data = e.data;
  const result = hslToColor(hslValuesFromContext(data.image))
  self.postMessage({ result : result })
}, false);

function hslToColor(hslArray) {
  //converts hue to color groups
  hslArray = hslArray.map(function(d){
      var hue = d.h;

      if (hue < 23){
          d.group = 'red';
      } else if (hue < 42){
          d.group = 'orange';
      } else if (hue < 70){
          d.group = 'yellow';
      } else if (hue < 164){
          d.group = 'green';
      } else if (hue < 203){
          d.group = 'cyan';
      } else if (hue < 262){
          d.group = 'blue';
      } else if (hue < 299){
          d.group = 'purple';
      } else if (hue < 337){
          d.group = 'magenta';
      } else {
          d.group = 'red';
      }

      return d;
  });

  return hslArray;
}

function bound01 (n, max) {
  n = Math.min(max, Math.max(0, parseFloat(n)))

  // Handle floating point rounding errors
  if (Math.abs(n - max) < 0.000001)
    return 1
  else
    // Convert into [0, 1] range if it isn't already
    return n % max / parseFloat(max)
}

function rgbToHsl(r, g, b) {
  r = bound01(r, 255);
  g = bound01(g, 255);
  b = bound01(b, 255);

  var max = Math.max(r, g, b), min = Math.min(r, g, b);
  var h, s, l = (max + min) / 2;

  if (max == min)
    h = s = 0; // achromatic
  else {
    var d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;

      case g: h = (b - r) / d + 2; break;

      case b: h = (r - g) / d + 4; break;
    }

    h /= 6;
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
}

function hslValuesFromContext (imageData) {
  var hslValues = [ ]

  for (var x = 0; x < imageData.width; ++x)
    for (var y = 0; y < imageData.height; ++y) {
      var index = (x + y * imageData.width) * 4

      var r = imageData.data[index + 0]
      var g = imageData.data[index + 1]
      var b = imageData.data[index + 2]
      var hsl = rgbToHsl(r, g, b)

      hslValues.push(hsl)
    }

  return hslValues
}
