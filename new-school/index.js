// Originally based on http://craftymind.com/factory/html5video/CanvasVideo.html

// See https://kangax.github.io/compat-table/es6/
// See https://www.codementor.io/classes/es6-crash-course

import listenToInputs                     from './event-delegates/form-input-listener'
import scheduleHSLWorker                  from './scheduled-worker-manager'
import ExplodingTiles                     from './containers/exploding-tiles'
import { render as renderCirclePack }     from './components/circle-pack'
import { render as renderHSLColorMap }    from './components/hsl-color-map'
import { render as renderHueBar }         from './components/hue-bar'
import { matchesKeyCodes, isNotKeyCombo } from './event-delegates/keyboard'

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
