window.isNotKeyCombo = (e) =>
  !e.shiftKey && !e.metaKey && !e.altKey && !e.ctrlKey

const matchesKeyCode = window.matchesKeyCode = (e, charCodeOrKeyName) =>
  isFinite(charCodeOrKeyName) ? e.charCode === charCodeOrKeyName : e.code === charCodeOrKeyName

window.matchesKeyCodes = (e, charCodesAndOrKeyNames) =>
  charCodesAndOrKeyNames.some(matchesKeyCode.bind(null, e))
