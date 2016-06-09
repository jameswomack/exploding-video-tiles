// Self is the equivalent of `window` (browser) or `global` (server)
var processCounter = { count : 0 }

// https://github.com/webpack/webpack/tree/master/examples/web-worker
// https://github.com/webpack/worker-loader
addEventListener('message', function (e) {
  var data = e.data;

  if (!data.image) {
    // "Typed arrays & ImageData"
    // http://www.ecma-international.org/ecma-262/6.0/#sec-uint8clampedarray
    // https://developer.mozilla.org/en-US/docs/Web/API/ImageData/data
    console.error('`data.image` is falsey, specifically:', data.image)
  } else {
    // `const`
    var result = hslToColor(hslValuesFromContext(data.image))
    console.info('Successfully processed image data in our web worker', ++processCounter.count)
    self.postMessage({ result : result })
  }
}, false);

function hslToColor(imageData, scale) {
  //converts hue to color groups

  var dataHash = {};
  var newData = [];

   function scale(value) {
     return Math.round(value/2)*2;
   }

  imageData.forEach(d => {

    var datapoint = {};

    datapoint.h = scale(d.h)
    datapoint.s = scale(d.s)
    datapoint.l = scale(d.l)

    if (datapoint.l === 0) {
      datapoint.h = 0;
      datapoint.s = 0;
      datapoint.l = 0;
    }

    if (datapoint.l === 100) {
      datapoint.h = 0;
      datapoint.s = 0;
      datapoint.l = 100;
    }

    datapoint.group = d.group;
    datapoint.value = 1;

    var hue = datapoint.h;

    if (hue < 23){
        datapoint.group = "red";
    } else if (hue < 42){
        datapoint.group = "orange";
    } else if (hue < 70){
        datapoint.group = "yellow";
    } else if (hue < 164){
        datapoint.group = "green";
    // } else if (hue < 203){
    //     datapoint.group = "cyan";
    } else if (hue < 252){ //262
        datapoint.group = "blue";
    } else if (hue < 337){ //299
        datapoint.group = "purple";
    // } else if (hue < 337){
    //     datapoint.group = "magenta";
    } else {
        datapoint.group = "red";
    }

    var hashString = datapoint.group + "-" + datapoint.h + "-" + datapoint.s + "-" + datapoint.l;
    datapoint.key = hashString;

    if (dataHash[hashString]) {
      dataHash[hashString].value = dataHash[hashString].value + 1;
    } else {
      dataHash[hashString] = datapoint;
      newData.push(datapoint);
    }

    });

  return newData;
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

  if (max == min) // eslint-disable-line
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
