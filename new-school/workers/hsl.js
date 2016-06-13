/*
 * For Webpack-specific knowledge see
 * https://github.com/webpack/webpack/tree/master/examples/web-worker
 * https://github.com/webpack/worker-loader
 *
 * Otherwise
 * https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers
*/

// `addEventListener` is global to a Web Worker, i.e., it's on `self`
addEventListener('message', ({ origin, data : { image } }) => {
  if (origin && origin.startsWith('chrome-extension')) {
    console.error('Received message from a Chrome extension, ignoring', origin)
    return
  }

  if (!image) {
    // "Typed arrays & ImageData"
    // http://www.ecma-international.org/ecma-262/6.0/#sec-uint8clampedarray
    // https://developer.mozilla.org/en-US/docs/Web/API/ImageData/data
    console.error('`data.image` is falsey, specifically:', image)
  } else {
    // `const`
    const hslValues = hslToColor(hslValuesFromContext(image))
    postMessage({ hslValues }) // global to a Web Worker, i.e., it's on `self`
  }
}, false);


//converts hue to color groups
function hslToColor(imageData, scale) {
  const dataHash = {};
  const newData  = [];

  function scale (value) {
    return Math.round(value/2)*2;
  }

  // Push data into `dataHash` and `newData`
  imageData.forEach(d => {
    const datapoint = {};

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

    const hue = datapoint.h;

    if (hue < 23){
        datapoint.group = 'red';
    } else if (hue < 42){
        datapoint.group = 'orange';
    } else if (hue < 70){
        datapoint.group = 'yellow';
    } else if (hue < 164){
        datapoint.group = 'green';
    } else if (hue < 252){ //262
        datapoint.group = 'blue';
    } else if (hue < 337){ //299
        datapoint.group = 'purple';
    } else {
        datapoint.group = 'red';
    }

    const hashString = datapoint.group + "-" + datapoint.h + "-" + datapoint.s + "-" + datapoint.l; // eslint-disable-line
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

// Convert 0—255 or other ranges to 0—1
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

  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s;
  const l = (max + min) / 2;

  if (max == min) // eslint-disable-line
    h = s = 0; // achromatic
  else {
    const d = max - min;
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

// Basically call `rgbToHsl` on each color segment
// in the `Uint8ClampedArray` received
function hslValuesFromContext (imageData) {
  const hslValues = [ ]

  // Iterate of the passed-in `Uint8ClampedArray`,
  // based on the image's width & height
  for (let x = 0; x < imageData.width; ++x)
    for (let y = 0; y < imageData.height; ++y) {
      const index = (x + y * imageData.width) * 4

      const r = imageData.data[index + 0]
      const g = imageData.data[index + 1]
      const b = imageData.data[index + 2]
      const hsl = rgbToHsl(r, g, b)

      hslValues.push(hsl)
    }

  return hslValues
}
