export default function ({ formEl, onChange }) {
  const inputs = formEl.querySelectorAll('input')

  // TODO: Opportunity to use `NodeList.prototype[Symbol.iterator]` ?
  // `Array.from` ? Not `Array.of`
  for (let i=0; i < inputs.length; i++) {
    const inputEl = inputs[i]
    inputEl.onchange = onChange
    inputEl.keydown  = onChange
  }
}
