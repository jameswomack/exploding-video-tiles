// `export` & parameter destructuring
window.isNotKeyCombo = function (e) {
  return !e.shiftKey && !e.metaKey && !e.altKey && !e.ctrlKey
}

var matchesKeyCode = window.matchesKeyCode = function (e, charCodeOrKeyName) {
  return isFinite(charCodeOrKeyName) ? e.charCode === charCodeOrKeyName : e.code === charCodeOrKeyName
}

// arrow fn
window.matchesKeyCodes = function (e, charCodesAndOrKeyNames) {
  return charCodesAndOrKeyNames.some(matchesKeyCode.bind(null, e))
}
