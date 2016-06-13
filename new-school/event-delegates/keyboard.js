// TODO: `export` & parameter destructuring

export function isNotKeyCombo (e) {
  return !e.shiftKey && !e.metaKey && !e.altKey && !e.ctrlKey
}

const matchesKeyCode = function matchesKeyCode (e, charCodeOrKeyName) {
  return Number.isFinite(charCodeOrKeyName) ? e.charCode === charCodeOrKeyName : e.code === charCodeOrKeyName
}

export function matchesKeyCodes (e, charCodesAndOrKeyNames) {
  // TODO: arrow fn
  return charCodesAndOrKeyNames.some(matchesKeyCode.bind(null, e))
}
