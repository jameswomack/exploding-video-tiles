// Originally based on http://craftymind.com/factory/html5video/CanvasVideo.html

// See https://kangax.github.io/compat-table/es6/
// See https://www.codementor.io/classes/es6-crash-course

/*
  import
*/

// Equivalent of `require`
import listenToInputs                     from './event-delegates/form-input-listener'
import scheduleHSLWorker                  from './scheduled-worker-manager'
import ExplodingTiles                     from './containers/exploding-tiles'

// import something as something else
import { render as renderCirclePack }     from './components/circle-pack'
import { render as renderHSLColorMap }    from './components/hsl-color-map'
import { render as renderHueBar }         from './components/hue-bar'

// Destructured imports (can be done with default and individual imports)
import { matchesKeyCodes, isNotKeyCombo } from './event-delegates/keyboard'

/*
  A Built-ins Refresher


  JavaScript's standard, built-in objects, including their methods and properties.

  These are "global objects" (or standard built-in objects) that are note either created by the user code or provided by the host application. Relative to JavaScript itself, both browsers and server hosts such as Node.js are "applications". For more information about the distinction between the DOM and core JavaScript, see https://mzl.la/1UkrADP.
*/

// `document` is not a built-in
document.addEventListener('DOMContentLoaded', () => {
  const { copyCtx, videoEl, updateTileModeAttribute } =
    new ExplodingTiles({
      copyCanvasEl : document.getElementById('sourcecopy'),
      videoEl      : document.getElementById('sourcevid'),
      outputEl     : document.getElementById('output'),
      shouldStart  : true
    })

  videoEl.volume = 0

  listenToInputs({
    formEl   : document.querySelector('form'),
    onChange : function ({ currentTarget }) {
      const { name, value } = currentTarget
      updateTileModeAttribute(name, value)
    }
  })

  // Use another thread to creata data needed for
  // data viz based on canvas/video info
  scheduleHSLWorker({
    msBetweenRuns : 1000,
    getShouldRun  : () => !videoEl.paused,
    getInput      : () =>
      ({ image : copyCtx.getImageData(100, 100, copyCtx.canvas.width/2, copyCtx.canvas.height/2) }),
    receiveData   : ({ hslValues }) => {
      Object.entries({
        circlePack : renderCirclePack,
        colorMap   : renderHSLColorMap,
        hueBar     : renderHueBar
      })
      .forEach(([ id, renderer ]) =>
        renderer(`#color-analysis svg#${id}`, hslValues))
    },
  })

  // Toggle video on spacebar or P
  document.addEventListener('keypress', e => {
    matchesKeyCodes(e, [ 112, 32 ]) && isNotKeyCombo(e) &&
        videoEl[videoEl.paused ? 'play' : 'pause']()
  })

  const instrEl = document.getElementById('keyboard-event-instructions')
  attemptNotification(instrEl.innerText || instrEl.textContent, success => {
    !success && instrEl.classList.remove('hide')
  })
})


export function attemptNotification (msg, next) {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    console.error('Notification API unavailable')
    return next(false)
  } else if (window.Notification.permission === 'granted')
    return next(true, new window.Notification(msg))
  else if (window.Notification.permission !== 'denied')
    window.Notification.requestPermission(permission => {
      if (permission === 'granted')
        return next(true, new window.Notification(msg))
      else {
        console.error(`Notification request denied ${permission}`)
        return next(false)
      }
    })
  else {
    console.error('Notification request previously denied')
    return next(false)
  }
}
