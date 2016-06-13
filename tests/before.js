import jsdom from 'jsdom'

global.document  = jsdom.jsdom(`<!doctype html><html><body><section id="color-analysis" class="center">
  <svg id="colorMap"   class="center"></svg>
  <svg id="hueBar"     class="center"></svg>
  <svg id="circlePack" class="center"></svg>
</section></body></html>`)
global.window    = document.defaultView
global.navigator = global.window.navigator
