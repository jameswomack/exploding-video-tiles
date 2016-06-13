/* eslint-disable no-shadow */
import test from 'tape'
import {
  attemptNotification
}  from '../../new-school/'

test('attemptNotification', ({ end, test }) => {
  test('sans window', ({ equal, end }) => {
    const win = global.window
    global.window = undefined
    attemptNotification('foo', succeeded => {
      equal(succeeded, false, 'attemptNotification immediately calls next with false if there\'s no window')
      global.window = win
      end()
    })
  })

  test('with window', ({ equal, end }) => {
    attemptNotification('foo', succeeded => {
      equal(typeof Notification, 'undefined', 'There\'s no Notification')
      equal(succeeded, false, 'attemptNotification immediately calls next with false if there\'s no Notification')
      end()
    })
  })

  test('with window and Notification granted', ({ equal, end }) => {
    shimNotification('granted')
    attemptNotification('foo', (succeeded, note) => {
      equal(typeof global.window.Notification, 'function', 'There\'s a shimmed Notification')
      equal(succeeded, true, 'attemptNotification immediately calls next with true if permission was already granted')
      equal(note instanceof global.window.Notification, true, 'note is a Notification instance')
      unshimNotification()
      end()
    })
  })

  test('with window and Notification denied', ({ equal, end }) => {
    shimNotification('denied', 'granted')
    attemptNotification('foo', succeeded => {
      equal(typeof global.window.Notification, 'function', 'There\'s a shimmed Notification')
      equal(succeeded, false, 'attemptNotification immediately calls next with false if permission was already denied')
      unshimNotification()
      end()
    })
  })

  test('with window and Notification never asked for, then granted', ({ equal, end }) => {
    shimNotification(undefined, 'granted')
    attemptNotification('foo', (succeeded, note) => {
      equal(succeeded, true, 'attemptNotification calls next with true if permission was granted')
      equal(note instanceof global.window.Notification, true, 'note is a Notification instance')
      unshimNotification()
      end()
    })
  })

  test('with window and Notification never asked for, then denied', ({ equal, end }) => {
    shimNotification(undefined, 'denied')
    attemptNotification('foo', (succeeded, note) => {
      equal(succeeded, false, 'attemptNotification calls next with false if permission was denied')
      equal(note instanceof global.window.Notification, false, 'note was not passed')
      unshimNotification()
      end()
    })
  })

  test('with window and Notification never asked for, then denied', ({ equal, end }) => {
    shimNotification('granted')
    attemptNotification('foo', (succeeded, note) => {
      equal(note.msg, 'foo', 'The first arg is passed through to Notification')
      unshimNotification()
      end()
    })
  })

  end()
})

function NotificationShim (msg) { this.msg = msg }

function shimNotification (perm, newPerm) {
  global.window.Notification = NotificationShim
  global.window.Notification.requestPermission = next => next(newPerm)
  global.window.Notification.permission = perm
}

function unshimNotification () {
  global.window.Notification = undefined
}
