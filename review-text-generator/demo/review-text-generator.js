/* global tf, fetch */

const modelUrl = '/model/model.json'

const charsArrayUrl = '/assets/chars-array.json'

const seedTextLength = 256
const seedTextPadding = ' '
const temperature = 0.6
const numCharsGen = 50

let model
let charsArray

/**
 * load the TensorFlow.js model
 */
window.loadModel = async function () {
  disableElements()
  message('loading model...')

  let start = (new Date()).getTime()

  // https://js.tensorflow.org/api/1.1.2/#loadLayersModel
  model = await tf.loadLayersModel(modelUrl)

  let end = (new Date()).getTime()

  message(`model loaded in ${(end - start) / 1000} secs`, true)
  enableElements()
}

/**
 * run the model and get a prediction
 */
window.runModel = async function () {
  disableElements()
  message('running inference...')
  message('this may take awhile')

  let seedText = document.getElementById('seedtext').value
  if (seedText) {
    seedText = seedText.trim()
  }

  if (seedText) {
    if (!charsArray) {
      await loadCharsArray()
    }

    let generated = ''
    let sentence = normalizeInput(seedText)

    let start = (new Date()).getTime()

    for (let i = 0; i < numCharsGen; i++) {
      let txt = preprocessInput(sentence, charsArray.length)

      console.log(`model.predict (input, ${i}):`, txt)

      // https://js.tensorflow.org/api/latest/#tf.Model.predict
      let pred = model.predict(txt)

      let nextIndex = samplePrediction(pred)
      let nextChar = charsArray[nextIndex]

      console.log(`model.predict (output, ${i}): ${nextIndex}(${nextChar})`)

      generated += nextChar
      sentence = sentence.substring(1) + nextChar
    }

    let end = (new Date()).getTime()

    document.getElementById('outputtext').value = document.getElementById('seedtext').value + generated
    message(`inference ran in ${(end - start) / 1000} secs`, true)
    enableElements()
  } else {
    message('no seed text provided', true)
  }
}

/**
 * convert sentence to Tensor input required by the model
 *
 * @param {string} sentenceInput - the sentence text
 */
function preprocessInput (sentenceInput) {
  console.log('preprocessInput started')

  // https://js.tensorflow.org/api/latest/#buffer
  let x = tf.buffer([1, seedTextLength, charsArray.length])

  for (var j = 0; j < sentenceInput.length; j++) {
    x.set(1, 0, j, charsArray.indexOf(sentenceInput.charAt(j)))
  }

  let preprocessed = x.toTensor()

  console.log('preprocessInput completed:', preprocessed)
  return preprocessed
}

/**
 * normalize input text to length (and case) expected by the model
 *
 * @param {string} input - the seed text
 */
function normalizeInput (input) {
  // https://github.com/IBM/MAX-Review-Text-Generator/blob/master/core/backend.py#L61
  let sentence = input.toLowerCase()

  // The text passed into the model must be exactly seedTextLength
  // characters long, or the model will crash. Pad or truncate.
  if (sentence.length > seedTextLength) {
    sentence = sentence.substr(0, seedTextLength)
  } else if (sentence.length < seedTextLength) {
    sentence = seedTextPadding.repeat(seedTextLength - sentence.length) + sentence
  }

  return sentence
}

/**
 * sample an index from the model Tensor output probability array
 *
 * @param {Tensor} output - the model output
 */
function samplePrediction (output) {
  // https://github.com/IBM/MAX-Review-Text-Generator/blob/master/core/backend.py#L36
  let predexp = output
    .as1D()
    .log()
    .div(tf.scalar(temperature))
    .exp()

  return predexp
    .div(predexp.sum())
    .argMax()
    .dataSync()[0]
}

async function loadCharsArray () {
  console.log('loading chars array...')
  console.time('loadCharsArray')

  let response = await fetch(charsArrayUrl)
  charsArray = await response.json()

  if (charsArray && charsArray.hasOwnProperty('charsArray')) {
    charsArray = charsArray['charsArray']
  } else {
    console.log('failed to fetch characters array')
    return Promise.reject(new Error('characters array not obtained'))
  }

  console.timeEnd('loadCharsArray')
}

function disableElements () {
  const buttons = document.getElementsByTagName('button')
  for (var i = 0; i < buttons.length; i++) {
    buttons[i].setAttribute('disabled', true)
  }

  document.getElementById('seedtext').setAttribute('disabled', true)
}

function enableElements () {
  const buttons = document.getElementsByTagName('button')
  for (var i = 0; i < buttons.length; i++) {
    buttons[i].removeAttribute('disabled')
  }

  document.getElementById('seedtext').removeAttribute('disabled')
}

function message (msg, highlight) {
  let mark = null
  if (highlight) {
    mark = document.createElement('mark')
    mark.innerText = msg
  }

  const node = document.createElement('div')
  if (mark) {
    node.appendChild(mark)
  } else {
    node.innerText = msg
  }

  document.getElementById('message').appendChild(node)
}

function init () {
  message(`tfjs version: ${tf.version.tfjs}`, true)
}

// ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init)
} else {
  setTimeout(init, 500)
}
